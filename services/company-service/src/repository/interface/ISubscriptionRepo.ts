import type { ISubscription } from '../../models/subscription.model';
import type { SubscriptionType } from '../../types/subscription.type';

export interface ISubscriptionRepository {
    create(subscriptionData: Partial<ISubscription>): Promise<ISubscription>;
    findById(id: string): Promise<ISubscription | null>;
    findAll(): Promise<ISubscription[]>;
    update(id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription | null>;
    delete(id: string): Promise<boolean>;
    findByType(type: SubscriptionType): Promise<ISubscription | null>;
    findOne(query: any): Promise<ISubscription | null>;
} 