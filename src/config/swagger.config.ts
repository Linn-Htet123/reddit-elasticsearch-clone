import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Reddit Elasticsearch Clone API')
    .setDescription('API documentation for Reddit Elasticsearch Clone')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Optional: JSON setup
  SwaggerModule.setup('api-json', app, document, {
    jsonDocumentUrl: 'api-json',
    useGlobalPrefix: true,
  });
}
