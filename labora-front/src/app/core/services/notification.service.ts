import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private getToast(colorClass: string) {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      showCloseButton: true,
      customClass: {
        popup: colorClass
      }
    });
  }

  success(message: string) {
    this.getToast('').fire({
      icon: 'success',
      title: message,
      padding: '10px 20px',
    });
  }

  error(message: string) {
    this.getToast('').fire({
      icon: 'error',
      title: message,
      padding: '10px 20px',
    });
  }

  info(message: string) {
    this.getToast('').fire({
      icon: 'info',
      title: message,
      padding: '10px 20px',
    });
  }

  warning(message: string) {
    this.getToast('').fire({
      icon: 'warning',
      title: message,
      padding: '10px 20px',
    });
  }

  /**
   * Extrai de forma robusta e dinâmica a mensagem de erro retornada pelo backend.
   * Lida com strings brutas, objetos do tipo exceção, mensagens dentro de objetos de erro
   * e mapas de erros de validação de formulários (MethodArgumentNotValidException).
   */
  getErrorMsg(err: any): string {
    if (!err) {
      return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
    
    // Se o erro for uma string direta
    if (typeof err === 'string') {
      return err;
    }

    // Se o erro for o corpo desempacotado com erro de parsing (caso status 400 e e = error.error)
    if (err.text && typeof err.text === 'string') {
      const text = err.text.trim();
      if (!text.startsWith('<html') && !text.startsWith('<!DOCTYPE')) {
        return text;
      }
    }

    // Se o erro vier de um objeto de erro do HttpClient (HttpErrorResponse)
    if (err.error) {
      const apiError = err.error;

      // Se for um erro de parsing e tiver a propriedade 'text'
      if (apiError.text && typeof apiError.text === 'string') {
        const text = apiError.text.trim();
        if (!text.startsWith('<html') && !text.startsWith('<!DOCTYPE')) {
          return text;
        }
      }

      // Se o corpo do erro for string direta
      if (typeof apiError === 'string') {
        return apiError;
      }

      // Se for um objeto com propriedade 'message'
      if (apiError.message && typeof apiError.message === 'string') {
        return apiError.message;
      }

      // Se for um mapa de validação de campos (ex: { cpf: "CPF inválido", email: "E-mail inválido" })
      if (typeof apiError === 'object' && apiError !== null && !(typeof ProgressEvent !== 'undefined' && apiError instanceof ProgressEvent)) {
        const errorValues = Object.values(apiError);
        if (errorValues.length > 0 && typeof errorValues[0] === 'string') {
          return errorValues[0];
        }
      }
    }

    // Se houver mensagem padrão no próprio erro
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }

    return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
}
