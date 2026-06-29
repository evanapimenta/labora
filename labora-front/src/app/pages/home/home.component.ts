import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { register } from 'swiper/element/bundle';
import { RouterLink } from '@angular/router';
import { IconLaboratoryComponent } from '../../icons/icon-laboratory';
import { IconLocationComponent } from '../../icons/icon-location';
import { IconFileComponent } from '../../icons/icon-file';
import { IconDownloadComponent } from '../../icons/icon-download';
import { IconShareComponent } from '../../icons/icon-share';
import { ScheduleController } from '../../core/controllers/schedule.controller';
import { AccessService } from '../../core/services/access.service';
import { TestController } from '../../core/controllers/test.controller';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  host: {
    'ngSkipHydration': 'true'
  },
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    RouterLink,
    IconLaboratoryComponent,
    IconLocationComponent,
    IconFileComponent,
    IconDownloadComponent,
    IconShareComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  slides = [
    {
      title: 'Agende seus exames sem enrolação',
      description: 'Marcação de exames de forma prática, rápida e segura.',
      buttonText: 'Agende agora',
      buttonLink: '/schedule',
      image: '/assets/Adventure_Illustrations/Laboratory/Laboratory.png',
      bgColor: 'bg-[#4C2A75]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#4C2A75]'
    },
    {
      title: 'Seus resultados, na palma da mão',
      description: 'Seus exames reunidos, de forma simples e prática.',
      buttonText: 'Ver meus exames',
      buttonLink: '/schedule',
      image: '/assets/Adventure_Illustrations/Medical Research/Medical Research.png',
      bgColor: 'bg-[#EFBD22]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#EFBD22]'
    },
    {
      title: 'Suporte fácil ao seu alcance',
      description: 'Tire suas dúvidas de forma rápida e descomplicada',
      buttonText: 'Atendimento online',
      buttonLink: '/',
      image: '/assets/Adventure_Illustrations/Medical Care/Medical Care.png',
      bgColor: 'bg-[#E75169]',
      btnClass: 'border-white text-white hover:bg-white hover:text-[#E75169]'
    }
  ];

  agendamentos: any[] = [];
  resultados: any[] = [];

  locais: any[] = [];
  locaisLoading = false;
  locaisError = '';
  exames: any[] = [];
  examesLoading = false;

  localSelecionado: any = null;
  exameSelecionado: any = null;

  isPreparoModalOpen = false;
  selectedPreparo: string | null = null;
  selectedTestName: string = '';

  // Reagendamento
  isRescheduleModalOpen = false;
  selectedAgendamento: any = null;
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  isRescheduling = false;
  rescheduleError: string = '';
  rescheduleSuccess = false;

  constructor(
    private scheduleController: ScheduleController,
    private accessService: AccessService,
    private testController: TestController,
    private router: Router
  ) {
    register();
  }

  ngOnInit(): void {
    if (this.accessService.access?.accessToken) {
      this.loadSchedules();
    }
    this.loadNearbyLocais();
    this.loadExamesRapido();
  }

  // ─── Geolocation + Nearby Cities ──────────────────────────────────────────

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async loadNearbyLocais() {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    this.locaisLoading = true;
    this.locaisError = '';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Check sessionStorage cache
        const cacheKey = `nearby_${userLat.toFixed(3)}_${userLng.toFixed(3)}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          this.locais = JSON.parse(cached);
          this.locaisLoading = false;
          return;
        }

        try {
          // Overpass API: municipalities within 20km radius
          const query = `
            [out:json][timeout:15];
            (
              node["place"~"^(city|town|village|municipality)$"]["name"](around:20000,${userLat},${userLng});
              way["place"~"^(city|town|village|municipality)$"]["name"](around:20000,${userLat},${userLng});
              relation["place"~"^(city|town|municipality)$"]["name"](around:20000,${userLat},${userLng});
            );
            out center;
          `;

          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
          });
          const data = await res.json();
          const elements: any[] = data.elements || [];

          const seen = new Set<string>();
          const nearby: any[] = [];

          for (const el of elements) {
            const lat = el.lat ?? el.center?.lat;
            const lng = el.lon ?? el.center?.lon;
            const name = el.tags?.name;
            if (!name || !lat || !lng || seen.has(name)) continue;
            seen.add(name);

            const dist = this.haversineKm(userLat, userLng, lat, lng);
            const stateCode = el.tags?.['addr:state'] || el.tags?.['is_in:state_code'] || '';
            const label = stateCode ? `${name} - ${stateCode}` : name;
            nearby.push({ nome: label, distKm: Math.round(dist) });
          }

          nearby.sort((a, b) => a.distKm - b.distKm);
          this.locais = nearby;

          sessionStorage.setItem(cacheKey, JSON.stringify(nearby));

          if (nearby.length === 0) {
            this.locaisError = 'Nenhum município encontrado a até 20 km.';
          }
        } catch (e) {
          this.locaisError = 'Erro ao buscar municípios próximos.';
        }
        this.locaisLoading = false;
      },
      (err) => {
        this.locaisLoading = false;
        if (err.code === 1) {
          this.locaisError = 'Permissão de localização negada.';
        } else {
          this.locaisError = 'Não foi possível obter sua localização.';
        }
      },
      { timeout: 10000 }
    );
  }


  // ─── Exames Rápidos ──────────────────────────────────────────────────────

  loadExamesRapido() {
    this.examesLoading = true;
    this.testController.getAll(0, 7).subscribe({
      next: (res: any) => {
        const list: any[] = (res.content || []).map((e: any) => ({
          id: e.id,
          nome: e.name
        }));
        // Append sentinel "Ver todos"
        list.push({ id: '__ver_todos__', nome: '→ Ver todos os exames', verTodos: true });
        this.exames = list;
        this.examesLoading = false;
      },
      error: () => {
        this.exames = [{ id: '__ver_todos__', nome: '→ Ver todos os exames', verTodos: true }];
        this.examesLoading = false;
      }
    });
  }

  onExameSelecionado(item: any) {
    if (!item) return;
    if (item.verTodos) {
      this.exameSelecionado = null;
      this.router.navigate(['/schedule']);
    }
  }

  loadSchedules() {

    this.scheduleController.getScheduled().subscribe({
      next: (res: any) => {
        // Sort from closest to furthest (scheduledFor is ISO string)
        this.agendamentos = (res || []).sort((a: any, b: any) => {
          return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames agendados:', err);
      }
    });

    this.scheduleController.getCompleted().subscribe({
      next: (res: any) => {
        // Sort from most recent to oldest (scheduledFor is ISO string)
        this.resultados = (res || []).sort((a: any, b: any) => {
          return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
        });
      },
      error: (err: any) => {
        console.error('Erro ao carregar exames concluídos:', err);
      }
    });
  }

  formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = months[d.getMonth()];
    const hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return { dia, mes, hora };
  }

  getFormattedDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} às ${hh}:${min}h`;
  }

  formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street || ''}, ${address.number || ''} - ${address.neighborhood || ''}, ${address.city || ''} - ${address.state || ''}`;
  }

  async printResult(url: string) {
    if (typeof window === 'undefined') return;

    try {
      // Usamos um proxy de CORS apenas para testes, pois o PDF da w3.org bloqueia requisições de localhost
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);

      // Abre uma nova aba vazia
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Escreve o HTML na nova aba contendo o PDF em tela cheia e o script de auto-impressão
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir Resultado</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #f3f4f6; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe id="pdfIframe" src="${blobUrl}"></iframe>
              <script>
                const iframe = document.getElementById('pdfIframe');
                iframe.onload = function() {
                  setTimeout(function() {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Se o popup for bloqueado pelo navegador
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error('Erro ao abrir nova aba de impressão:', e);
      window.open(url, '_blank');
    }
  }

  downloadResult(url: string, fileName: string) {
    if (typeof window !== 'undefined') {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        })
        .catch(err => {
          console.error('Erro ao fazer download do arquivo', err);
          // Fallback if fetch fails (e.g. CORS)
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    }
  }

  onBuscar() {
    const queryParams: any = {};
    if (this.exameSelecionado && !this.exameSelecionado.verTodos) {
      queryParams['exam'] = this.exameSelecionado.nome;
    }
    if (this.localSelecionado) {
      // city name is "Osasco - SP" → extract just the city part
      const cidade = (this.localSelecionado.nome || '').split(' - ')[0].trim();
      if (cidade) queryParams['city'] = cidade;
    }
    this.router.navigate(['/schedule'], { queryParams });
  }

  openPreparoModal(agendamento: any) {
    this.selectedTestName = agendamento.testName;
    this.selectedPreparo = agendamento.preparationInstructions || 'Nenhum preparo específico necessário para este exame.';
    this.isPreparoModalOpen = true;
  }

  closePreparoModal() {
    this.isPreparoModalOpen = false;
    setTimeout(() => {
      this.selectedPreparo = null;
      this.selectedTestName = '';
    }, 300);
  }

  openRescheduleModal(agendamento: any) {
    this.selectedAgendamento = agendamento;
    // Pre-fill with current date/time
    const current = agendamento.scheduledFor ? new Date(agendamento.scheduledFor) : new Date();
    this.rescheduleDate = current.toISOString().split('T')[0];
    const hh = String(current.getHours()).padStart(2, '0');
    const mm = String(current.getMinutes()).padStart(2, '0');
    this.rescheduleTime = `${hh}:${mm}`;
    this.rescheduleError = '';
    this.rescheduleSuccess = false;
    this.isRescheduleModalOpen = true;
  }

  closeRescheduleModal() {
    this.isRescheduleModalOpen = false;
    setTimeout(() => {
      this.selectedAgendamento = null;
      this.rescheduleDate = '';
      this.rescheduleTime = '';
      this.rescheduleError = '';
      this.rescheduleSuccess = false;
    }, 300);
  }

  get minRescheduleDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  confirmReschedule() {
    if (!this.rescheduleDate || !this.rescheduleTime) {
      this.rescheduleError = 'Selecione a data e horário.';
      return;
    }
    const scheduledFor = `${this.rescheduleDate}T${this.rescheduleTime}:00`;
    this.isRescheduling = true;
    this.rescheduleError = '';
    this.scheduleController.reschedule(this.selectedAgendamento.id, scheduledFor).subscribe({
      next: () => {
        this.isRescheduling = false;
        this.rescheduleSuccess = true;
        this.loadSchedules();
        setTimeout(() => this.closeRescheduleModal(), 1500);
      },
      error: (err: any) => {
        this.isRescheduling = false;
        this.rescheduleError = err?.message || 'Erro ao reagendar. Tente novamente.';
      }
    });
  }
}
