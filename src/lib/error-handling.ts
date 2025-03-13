export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    else {
        return `errore sconosciuto: ${String(error)}`;
    }
}
