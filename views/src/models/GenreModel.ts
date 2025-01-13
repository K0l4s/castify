export interface Genre {
    id: string;
    name: string;
    active: boolean;
    lastEdited: Date;
}

export interface genreCreateUpdate {
    name: string;
}