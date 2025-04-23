import mongoose, { Document, Schema } from 'mongoose';
import { SubscriptionType } from '../types/subscription.type';




export interface ISubscription extends Document {
    type: SubscriptionType;
    name: string;
    price: number;
    productId: string;
    priceId: string;
    features: {
        detailedJobDescription: boolean;
        jobLocationsCount: number;
        applicantsLimit: number | null;
        expiryDays: number;
        boostOnSearchPage: boolean;
        jobBranding: boolean;
    };
    validityDays: number;
    createdAt: Date;
    updatedAt: Date;
}





const SubscriptionSchema = new Schema<ISubscription>(
    {
        
        type: {
            type: String,
            enum: Object.values(SubscriptionType),
            required: true
        },
        name: {
            type: String,
            required: true
        },
        productId: {
            type: String,
            required: true
        },
        priceId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        features: {
            detailedJobDescription: {
                type: Number,
                default: 250
            },
            jobLocationsCount: {
                type: Number,
                default: 1
            },
            applicantsLimit: {
                type: Number,
                default: null
            },
            expiryDays: {
                type: Number,
                default: 30
            },
            boostOnSearchPage: {
                type: Boolean,
                default: false
            },
            jobBranding: {
                type: Boolean,
                default: false
            }
        },
        validityDays: {
            type: Number,
            default: 30
        }
    },
    {
        timestamps: true
    }
);





export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);


export async function seedDefaultSubscriptions() {
    try {

        const count = await Subscription.countDocuments();
        if (count > 0) return;

        

        await Subscription.create([
            {
                type: SubscriptionType.HOT_VACANCY,
                name: 'HOT - VACANCY',
                price: 1650,
                productId: "prod_SBHXQw942fmQxX",
                priceId:"price_1RGuyqKrOPuZIW5hYUJ1kkjc",
                features: {
                    detailedJobDescription: Infinity,
                    jobLocationsCount: 3,
                    applicantsLimit: Infinity,
                    expiryDays: 90,
                    boostOnSearchPage: true,
                    jobBranding: true
                },
                validityDays: 30
            },
            {
                type: SubscriptionType.CLASSIFIED,
                name: 'CLASSIFIED',
                price: 850,
                productId: "prod_SBIKsdkBzYoiBW",
                priceId:"price_1RGvk0KrOPuZIW5hbW0331gN",
                features: {
                    detailedJobDescription: 250,
                    jobLocationsCount: 3,
                    applicantsLimit: Infinity,
                    expiryDays: 90,
                    boostOnSearchPage: false,
                    jobBranding: false
                },
                validityDays: 30
            },
            {
                type: SubscriptionType.STANDARD,
                name: 'STANDARD',
                price: 400,
                priceId:"price_1RGvksKrOPuZIW5hCK7ZtZuF",
                productId: "prod_SBILzGUdQrl9zk",
                features: {
                    detailedJobDescription: 250,
                    jobLocationsCount: 1,
                    applicantsLimit: 200,
                    expiryDays: 30,
                    boostOnSearchPage: false,
                    jobBranding: false
                },
                validityDays: 30
            }

        ]);

        console.log('Default subscriptions seeded successfully');
    } catch (error) {
        console.error('Error seeding default subscriptions:', error);
    }
}