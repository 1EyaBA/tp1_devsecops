// src/app-user/dto/upload-photo.input.ts
import { Field, InputType } from '@nestjs/graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

@InputType()
export class UploadPhotoInput {
 
  @Field(() => String)
  file: string;
}
