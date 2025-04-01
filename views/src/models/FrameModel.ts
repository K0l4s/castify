export interface Frame {
    id: string;
    name: string;
    status: 'PROCESSING' | 'ACCEPTED' | 'REJECTED';
    imageURL: string;
    createdAt: string;
    lastEditedAt: string;
}

export interface FrameCreateUpdate {
    name: string;
    imageURL: string;
} 