"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../laboratorios/novo/form.module.css';
import { createBranch } from '@/actions/branch';

interface NovaFilialClientProps {
  labs: any[];
}

export default function NovaFilialClient({ labs }: NovaFilialClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createBranch(formData);
    
    setLoading(false);
    if (result.success) {
      alert('Filial criada com sucesso!');
      router.push('/laboratorios');
    } else {
      alert('Erro ao criar filial: ' + result.error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <Link href="/laboratorios" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar para listagem
          </Link>
          <h1 className={styles.title}>Nova Filial</h1>
          <p className={styles.subtitle}>Cadastre uma nova filial e vincule a um laboratório</p>
        </div>
      </header>

      <form className={`premium-card ${styles.formContainer}`} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Dados da Filial</h3>
          
          <div className={styles.inputGroup}>
            <label htmlFor="laboratoryId" className={styles.label}>Laboratório Matriz *</label>
            <select id="laboratoryId" name="laboratoryId" required className={styles.select}>
              <option value="">Selecione um laboratório</option>
              {labs.map((lab) => (
                <option key={lab._id} value={lab._id}>{lab.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Nome da Filial *</label>
            <input type="text" id="name" name="name" required className={styles.input} placeholder="Ex: Filial Centro" />
          </div>

          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Telefone *</label>
              <input type="text" id="phone" name="phone" required pattern="\d{10,11}" title="Telefone com 10 ou 11 dígitos numéricos" className={styles.input} placeholder="(00) 00000-0000" />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label htmlFor="email" className={styles.label}>E-mail *</label>
              <input type="email" id="email" name="email" required className={styles.input} placeholder="contato-filial@laboratorio.com.br" />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="openingHours" className={styles.label}>Horário de Funcionamento *</label>
            <input type="text" id="openingHours" name="openingHours" required className={styles.input} placeholder="Ex: Seg-Sex das 07h às 18h / Sáb das 07h às 12h" />
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Endereço da Filial</h3>

          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="zipCode" className={styles.label}>CEP *</label>
              <input type="text" id="zipCode" name="zipCode" required className={styles.input} placeholder="00000-000" />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label htmlFor="street" className={styles.label}>Logradouro (Rua, Av.) *</label>
              <input type="text" id="street" name="street" required className={styles.input} />
            </div>
          </div>

          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="number" className={styles.label}>Número *</label>
              <input type="text" id="number" name="number" required className={styles.input} />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label htmlFor="complement" className={styles.label}>Complemento</label>
              <input type="text" id="complement" name="complement" className={styles.input} placeholder="Sala, Andar, etc." />
            </div>
          </div>

          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="neighborhood" className={styles.label}>Bairro *</label>
              <input type="text" id="neighborhood" name="neighborhood" required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="city" className={styles.label}>Cidade *</label>
              <input type="text" id="city" name="city" required className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="state" className={styles.label}>Estado *</label>
              <input type="text" id="state" name="state" required className={styles.input} placeholder="Ex: SP" />
            </div>
          </div>

          <div className={styles.inputGroup} style={{ width: '33%' }}>
            <label htmlFor="country" className={styles.label}>País *</label>
            <input type="text" id="country" name="country" required defaultValue="Brasil" className={styles.input} />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={() => router.back()} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Salvando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Salvar Filial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
