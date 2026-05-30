
import { withMiddleware } from '../../../../../lib/middleware/withMiddleware.js';
import { supabaseAdmin } from '../../../../../lib/supabase.js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id: productId } = req.query;
  const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
  
  let modelFile = null;
  try {
    const [, files] = await form.parse(req);
    modelFile = files?.model?.[0];
    if (!modelFile) return res.status(400).json({ error: "No file" });

    // AUDIT #15: Use Streams instead of readFileSync to prevent 50MB memory pressure
    const fileStream = fs.createReadStream(modelFile.filepath);
    const storagePath = `models/${productId}/${Date.now()}.glb`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('product-assets')
      .upload(storagePath, fileStream, { contentType: 'model/gltf-binary', duplex: 'half' });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('product-assets').getPublicUrl(storagePath);
    await supabaseAdmin.from('products').update({ model_url: publicUrl }).eq('id', productId);

    return res.status(200).json({ success: true, url: publicUrl });
  } finally {
    // AUDIT #14: Ensure temp files are deleted even if upload fails
    if (modelFile?.filepath) fs.unlink(modelFile.filepath, () => {});
  }
}
export default withMiddleware(handler, { requireAdmin: true });
