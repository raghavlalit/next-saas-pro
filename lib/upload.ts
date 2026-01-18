// export async function uploadFile(file: File): Promise<string> {
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
// 
//     // Create a unique filename
//     // const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     // const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, '-')}`;
//     // const uploadDir = join(process.cwd(), 'public', 'uploads');
//     // const filepath = join(uploadDir, filename);
// 
//     // await writeFile(filepath, buffer);
// 
//     // return `/uploads/${filename}`;
// }

export async function uploadFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}
