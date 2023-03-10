import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Article, ArticleDocument } from './article.schema';

@Injectable()
export class ArticleRepository {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  async orThrow<T>(x: T | null) {
    if (x == null) throw new NotFoundException('Article not found');
    return x;
  }

  async orThrowArray<T>(x: T[]) {
    if (x.length == 0) {
      throw new NotFoundException('No article found');
    }
    return x;
  }

  create(article: Article): Promise<ArticleDocument> {
    return this.articleModel.create(article);
  }

  findWithQuery(articleFilterQuery: FilterQuery<Article>): Promise<ArticleDocument[]> {
    const mongoQuery = [
      {
        $lookup: {
          from: 'users',
          as: 'owner',
          localField: 'owner',
          foreignField: '_id',
        },
      },
      { $match: articleFilterQuery },
      { $unwind: '$owner' },
    ];
    return this.articleModel.aggregate(mongoQuery).exec().then(this.orThrowArray);
  }

  findAll(): Promise<ArticleDocument[]> {
    return this.articleModel.find().populate('owner').exec().then(this.orThrowArray);
  }

  findOneById(articleId: string): Promise<ArticleDocument> {
    return this.articleModel.findOne({ _id: articleId }).populate('owner').exec().then(this.orThrow);
  }

  update(articleToUpdate: ArticleDocument, newArticle: Partial<Article>): Promise<ArticleDocument> {
    return this.articleModel
      .findOneAndUpdate({ _id: articleToUpdate.id }, newArticle, { new: true })
      .populate('owner')
      .exec()
      .then(this.orThrow);
  }

  delete(articleFilterQuery: FilterQuery<Article>): Promise<ArticleDocument> {
    return this.articleModel.findOneAndRemove(articleFilterQuery).exec().then(this.orThrow);
  }
}
