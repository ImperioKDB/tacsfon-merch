
import { withMiddleware } from '../../../../../lib/middleware/withMiddleware.js'
import { sendSuccess }    from '../../../../../lib/responseFormatter.js'
import { ApiError }       from '../../../../../lib/errorHandler.js'
import { supabaseAdmin }  from '../../../../../lib/supabase.js'
import formidable         from 'formidable'
import fs                 from 'fs'

export const config = { api: { bodyParser: false } }

const MAX_SIZE = 10 * 1024 * 1024; // INCREASED TO 10MB

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id: productId } = req.query;

  const form = formidable({ 
    maxFileSize: MAX_SIZE,
    keepExtensions: true 
  });

  try {
    const [, files] = await form.parse(req);
    const imageFile = files?.image?.[0];

    if (!imageFile) throw new ApiError('INVALID_INPUT', 'No image file received.', 400);

    const fileBuffer = fs.readFileSync(imageFile.filepath);
    const ext = imageFile.originalFilename.split('.').pop();
    const storagePath = `images/${productId}/main_${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('product-assets')
      .upload(storagePath, fileBuffer, { contentType: imageFile.mimetype, upsert: true });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('product-assets').getPublicUrl(storagePath);
    
    await supabaseAdmin.from('products').update({ 
      image_url: publicUrl,
      updated_at: new Date().toISOString() 
    }).eq('id', productId);

    return sendSuccess(res, { url: publicUrl }, "Image uploaded successfully");
  } catch (err) {
    console.error("Upload Error:", err.message);
    return res.status(err.status || 500).json({ 
        success: false, 
        error: { code: "UPLOAD_FAILED", message: err.message } 
    });
  } finally {
    // Clean up temp file
  }
}

export default withMiddleware(handler, { requireAdmin: true });
