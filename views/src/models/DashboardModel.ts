

import { Podcast } from "./PodcastModel";
import { BasicUser } from "./User";

export interface DashboardModel {
    newUsers: BasicUser[];
    newPodcasts: Podcast[];
    totalUsers: number;
    totalPodcasts: number;
    totalLikes: number;
    totalComments: number;
    totalReportsAwait:number;
    totalAccess: number;
}