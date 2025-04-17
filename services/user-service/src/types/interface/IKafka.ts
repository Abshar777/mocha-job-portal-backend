import type { Consumer, Producer } from "kafkajs";
import type { messageType, TOPIC_TYPE,  } from "../kafkaType";
import { Event } from "../enums";

export default interface IKafka{
    // producers
    // connectProducer():Promise<Producer>;
    // disconnectProducer():void;
    publish (topic: TOPIC_TYPE, message:messageType,event:Event) : Promise<void>;
    subscribe(topic: TOPIC_TYPE,groupId:string,messageHandler:Function) : Promise<void>;

}




