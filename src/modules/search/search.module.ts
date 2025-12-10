import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.getOrThrow<string>('ELASTICSEARCH_HOSTS'),
        auth: {
          username: configService.getOrThrow<string>('ELASTIC_USERNAME'),
          password: configService.getOrThrow<string>('ELASTIC_PASSWORD'),
        },
      }),
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
