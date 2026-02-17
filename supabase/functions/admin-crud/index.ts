import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS', // <--- Agregamos DELETE aquí
}

serve(async (req) => {
  // Manejo de CORS (Permisos del navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Conexión Maestra
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 2. Seguridad: Verificar Token y Rol de Admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: usuarioLlamando } } = await supabaseAdmin.auth.getUser(token)
    
    if (!usuarioLlamando) throw new Error("Usuario no autenticado")

    const { data: esAdmin } = await supabaseAdmin
      .from('usuarioRol')
      .select('roles!inner(nombreRol)')
      .eq('usuarioID', usuarioLlamando.id)
      .eq('roles.nombreRol', 'Administrador')
      .single()

    if (!esAdmin) throw new Error("⛔ No tienes permisos de Administrador.")

    // Leemos los datos que llegan (funciona para POST, PUT y DELETE)
    const datos = await req.json()

    // ======================================================
    // 🟢 MODO CREAR (POST)
    // ======================================================
    if (req.method === 'POST') {
        const { data: nuevoAuth, error: errAuth } = await supabaseAdmin.auth.admin.createUser({
            email: datos.email,
            password: "123456",
            email_confirm: true,
            user_metadata: { nombre: datos.primerNombre }
        })
        if (errAuth) throw errAuth 
        const newId = nuevoAuth.user.id

        await supabaseAdmin.from('usuarios').insert([{
            id: newId,
            primerNombre: datos.primerNombre,
            segundoNombre: datos.segundoNombre,
            primerApellido: datos.primerApellido,
            segundoApellido: datos.segundoApellido,
            numeroDocumento: datos.numeroDocumento,
            estado: 'ACTIVO'
        }])
        
        await supabaseAdmin.from('usuarioRol').upsert([{ usuarioID: newId, rolID: datos.rolID }])
        await supabaseAdmin.from('usuarioArea').upsert([{ usuarioID: newId, areaID: datos.areaID }])

        return new Response(JSON.stringify({ message: 'Creado', id: newId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ======================================================
    // 🟠 MODO ACTUALIZAR (PUT)
    // ======================================================

    if (req.method === 'PUT') {
        const userId = datos.id; 

        // 1. Actualizar Email (Solo si se envía)
        if (datos.email) {
            const { error: errEmail } = await supabaseAdmin.auth.admin.updateUserById(userId, { email: datos.email })
            if (errEmail) throw new Error("Error actualizando email: " + errEmail.message)
        }

        // 2. Construimos el objeto de actualización dinámicamente
        // Esto evita borrar datos si no se envían todos los campos
        const perfilUpdates: any = {};
        if (datos.primerNombre) perfilUpdates.primerNombre = datos.primerNombre;
        if (datos.segundoNombre !== undefined) perfilUpdates.segundoNombre = datos.segundoNombre;
        if (datos.primerApellido) perfilUpdates.primerApellido = datos.primerApellido;
        if (datos.segundoApellido !== undefined) perfilUpdates.segundoApellido = datos.segundoApellido;
        if (datos.numeroDocumento) perfilUpdates.numeroDocumento = datos.numeroDocumento;
        if (datos.estado) perfilUpdates.estado = datos.estado; // <--- ¡AQUÍ ESTÁ LA CLAVE!

        // Solo llamamos a update si hay algo que actualizar en perfil
        if (Object.keys(perfilUpdates).length > 0) {
            const { error: errPerfil } = await supabaseAdmin
                .from('usuarios')
                .update(perfilUpdates)
                .eq('id', userId)
            
            if (errPerfil) throw errPerfil
        }

        // 3. Roles y Áreas (Solo si se envían)
        if (datos.rolID) await supabaseAdmin.from('usuarioRol').upsert({ usuarioID: userId, rolID: datos.rolID }, { onConflict: 'usuarioID' })
        if (datos.areaID) await supabaseAdmin.from('usuarioArea').upsert({ usuarioID: userId, areaID: datos.areaID }, { onConflict: 'usuarioID' })

        return new Response(JSON.stringify({ message: 'Actualizado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ======================================================
    // 🔴 MODO ELIMINAR / DESACTIVAR (DELETE)  <-- ¡AQUÍ ESTÁ LO NUEVO!
    // ======================================================
    if (req.method === 'DELETE') {
        const userId = datos.id; // Recibimos el ID a borrar

        // Solo lo marcamos Inactivo en la base de datos
        const { error: errDelete } = await supabaseAdmin
            .from('usuarios')
            .update({ estado: 'INACTIVO' })
            .eq('id', userId);

        if (errDelete) throw errDelete;

        return new Response(JSON.stringify({ message: 'Usuario desactivado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

  } catch (error) {
    // Este es el "catch final" del que hablaba
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})