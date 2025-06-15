// functions.ts

export function buildTitle(title: string): string {
    return `${title} | Admin`
}


export function getExpirationDate() {
    const now = new Date();
    const exp = new Date(now);
    exp.setFullYear(now.getFullYear() + 1);
    const month = String(exp.getMonth() + 1).padStart(2, "0");
    const year = exp.getFullYear();
    return `${month}/${year}`;
}