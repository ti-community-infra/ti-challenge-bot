export enum Status{
    // eslint-disable-next-line no-unused-vars
    Success,
    // eslint-disable-next-line no-unused-vars
    Failed
}

export interface Response<T>{
    data: T,
    status:Status;
    message:string;
}
