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