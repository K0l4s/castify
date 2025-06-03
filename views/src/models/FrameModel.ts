export interface Frame {
    id: string;
    name: string;
    status: 'PROCESSING' | 'ACCEPTED' | 'REJECTED';
    imageURL: string;
    price: number;
    createdAt: string;
    lastEditedAt: string;
}

export interface FrameCreateUpdate {
    name: string;
    imageURL: string;
} 

export interface CreateFrameEventModel {
    name:string;
    description:string;
    startDate: string;
    endDate:string;
    percent:number;
    active:boolean;
}