import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor, defina a variável de ambiente MONGODB_URI dentro de .env');
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const opts = {
    bufferCommands: false,
  };

  try {
    const conn = await mongoose.connect(MONGODB_URI as string, opts);
    console.log('✅ Conectado ao MongoDB!');
    return conn;
  } catch (error) {
    console.error('❌ Erro de conexão com o MongoDB:', error);
    throw error;
  }
}
