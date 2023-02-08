import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  addComment( comments: Comment): Promise<Comment> {
    return this.commentModel.create(comments);
  }

  findComments(commentsQueryFilter: FilterQuery<Comment>): Promise<Comment[]> {
    return this.commentModel.find(commentsQueryFilter).exec()
  }
}