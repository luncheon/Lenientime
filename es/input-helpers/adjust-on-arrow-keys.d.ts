export default function adjustOnArrowKeys(options?: {
    dataAttributeName?: string;
    formatSelector?: (input: HTMLInputElement) => string | undefined;
    amountSelector?: (input: HTMLInputElement) => number | undefined;
}): void;
