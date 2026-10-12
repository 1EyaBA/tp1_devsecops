import {Field, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class RidesPerMonth {
    @Field(() => String)
    month: string;

    @Field(() => Int)
    count: number;
}
