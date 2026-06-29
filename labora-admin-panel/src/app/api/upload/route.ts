import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const patientId = formData.get("patientId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const {
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME,
      R2_PUBLIC_DOMAIN,
    } = process.env;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error("Faltam variáveis de ambiente do Cloudflare R2 no .env");
      return NextResponse.json(
        { error: "Erro de configuração no servidor (R2)." },
        { status: 500 }
      );
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar um nome único e organizar em pasta por ID do paciente
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    // Se patientId existir, cria a pasta com ele, senão vai para "geral"
    const folder = patientId ? patientId : "geral";
    const objectKey = `laudos/${folder}/${uniqueSuffix}-${originalName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Construir a URL pública
    // Se o R2_PUBLIC_DOMAIN estiver configurado, usa ele (ex: pub-xxxx.r2.dev)
    // Se não, retorna apenas o caminho que o frontend precisa
    const cleanDomain = R2_PUBLIC_DOMAIN ? R2_PUBLIC_DOMAIN.replace(/^https?:\/\//, '') : '';
    const fileUrl = R2_PUBLIC_DOMAIN 
      ? `https://${cleanDomain}/${objectKey}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${objectKey}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    console.error("Erro no upload para o R2:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao processar o upload." },
      { status: 500 }
    );
  }
}
