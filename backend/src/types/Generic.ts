export type ImageObject = {
    url: string;
    height: number;
    width: number;
}

export type UnpackZodType<T> = T extends (infer U)[] ? U : T;