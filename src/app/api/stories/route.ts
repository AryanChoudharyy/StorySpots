import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, content, location, image } = await request.json()

    // Upload image to Supabase storage
    let imageUrl = null
    if (image) {
      const { data: imageData, error: imageError } = await supabase
        .storage
        .from('story-images')
        .upload(`${session.user.id}/${Date.now()}`, image, {
          contentType: 'image/jpeg'
        })

      if (imageError) throw imageError
      imageUrl = imageData.path
    }

    // Create story record
    const { data, error } = await supabase
      .from('stories')
      .insert([
        {
          title,
          content,
          location,
          image_url: imageUrl,
          user_id: session.user.id
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  
  const userId = searchParams.get('userId')
  const query = supabase.from('stories').select('*')
  
  if (userId) {
    query.eq('user_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}