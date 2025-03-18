export function logInfo(...args: unknown[]) {
    console.log(new Date().toISOString(), "INFO:", ...args)
}

export function logWarn(...args: unknown[]) {
    console.warn(new Date().toISOString(), "WARN:", ...args)
}

export function logErr(...args: unknown[]) {
    console.error(new Date().toISOString(), "ERR:", ...args)
}