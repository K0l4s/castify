export interface Genre {
    id: string;
    name: string;
    imageUrl: string | null;
    color: string | null;
    textColor: string | null;
    active: boolean;
    lastEdited: Date;
}

export interface genreCreateUpdate {
    name: string;
    image: File | null;
    color?: string;
    textColor?: string;
}