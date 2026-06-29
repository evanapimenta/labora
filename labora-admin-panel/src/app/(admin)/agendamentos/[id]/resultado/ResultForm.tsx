"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadExamResult } from '@/actions/result';
import { UploadCloud, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';

interface ResultFormProps {
  appointmentId: string;
  patientName: string;
  patientCpf: string;
}

export default function ResultForm({ appointmentId, patientName, patientCpf }: ResultFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const cleanName = patientName.toLowerCase().replace(/\s+/g, '_');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo de laudo (PDF).");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload the file to our Next.js API route which forwards to R2
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patientId", patientCpf.replace(/\D/g, '')); // Limpa pontuações

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        alert(`Erro no upload do arquivo: ${uploadResult.error || 'Erro desconhecido'}`);
        setUploading(false);
        return;
      }

      const fileUrl = uploadResult.fileUrl;
      const fileName = uploadResult.fileName;

      // 2. Save the result into the database using the server action
      startTransition(async () => {
        const result = await uploadExamResult(
          appointmentId,
          fileName,
          fileUrl,
          notes
        );

        if (result.success) {
          router.push('/agendamentos');
          router.refresh();
        } else {
          alert(`Erro ao salvar resultado: ${result.error}`);
        }
      });
    } catch (error) {
      console.error("Upload error", error);
      alert("Erro ao tentar fazer o upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-4">Anexar Laudo Técnico</h3>

        {selectedFile ? (
          <div className="border border-success/30 bg-success/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
            >
              Remover
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center">
            <UploadCloud className="size-10 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">Clique para anexar o Laudo</p>
            <p className="text-xs text-muted-foreground mt-1">Formatos aceitos: PDF</p>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-display font-semibold text-sm mb-4">Observações Clínicas / Laudo</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Insira as observações, valores de referência ou considerações adicionais..."
          className="w-full h-32 p-3 rounded-xl bg-muted/40 border border-border focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none text-sm transition-all resize-none"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-11 px-5 rounded-lg border border-border hover:bg-muted text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending || uploading || !selectedFile}
          className="h-11 px-6 rounded-lg text-white text-sm font-semibold flex items-center gap-2 shadow-glow transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: "var(--gradient-primary)" }}
        >
          <CheckCircle2 className="size-4" /> {(isPending || uploading) ? "Enviando..." : "Salvar e Concluir"}
        </button>
      </div>
    </form>
  );
}
