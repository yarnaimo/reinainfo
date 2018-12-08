import { Omit } from '@yarnaimo/rain'
import _getopts from 'getopts'

interface Options {
    alias?: { [key: string]: string | string[] }
    boolean?: string[]
    default?: { [key: string]: any }
    unknown?: (optionName: string) => boolean
}

export interface ParsedOptions {
    [key: string]: string
}

export const getopts = (
    argv: string[],
    options?: Omit<Options, 'boolean'>
): { _: string[] } & ParsedOptions => {
    return _getopts(argv, options)
}
