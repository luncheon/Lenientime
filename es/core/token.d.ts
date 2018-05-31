export interface LenientimeFormattable {
    readonly H: string;
    readonly HH: string;
    readonly _H: string;
    readonly h: string;
    readonly hh: string;
    readonly _h: string;
    readonly k: string;
    readonly kk: string;
    readonly _k: string;
    readonly m: string;
    readonly mm: string;
    readonly _m: string;
    readonly s: string;
    readonly ss: string;
    readonly _s: string;
    readonly S: string;
    readonly SS: string;
    readonly SSS: string;
    readonly a: string;
    readonly A: string;
    readonly aa: string;
    readonly AA: string;
}
export declare function format(template: string, time: LenientimeFormattable): string;
export declare function tokenAt(template: string, value: string, position: number): undefined | {
    /** @example 'hh' */
    property: string;
    /** @example '12' */
    value: string;
    index: number;
    adjust: (amount: number, cyclic?: boolean) => string | undefined;
};
export declare function tokenizeTemplate(template: string): {
    index: number;
    property: string;
    literal: boolean;
}[];
