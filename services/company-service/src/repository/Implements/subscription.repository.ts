import { Subscription, type ISubscription } from '../../models/subscription.model';
import type { ISubscriptionRepository } from '../interface/ISubscriptionRepo';
import type { SubscriptionType } from '../../types/subscription.type';

export class SubscriptionRepository implements ISubscriptionRepository {
    async create(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
        const subscription = new Subscription(subscriptionData);
        return await subscription.save();
    }

    async findById(id: string): Promise<ISubscription | null> {
        return await Subscription.findById(id);
    }

    async findAll(): Promise<ISubscription[]> {
        return await Subscription.find();
    }

    async update(id: string, subscriptionData: Partial<ISubscription>): Promise<ISubscription | null> {
        return await Subscription.findByIdAndUpdate(id, subscriptionData, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Subscription.findByIdAndDelete(id);
        return result !== null;
    }

    async findByType(type: SubscriptionType): Promise<ISubscription | null> {
        return await Subscription.findOne({ type });
    }

    async findOne(query: any): Promise<ISubscription | null> {
        return await Subscription.findOne(query);
    }
}
