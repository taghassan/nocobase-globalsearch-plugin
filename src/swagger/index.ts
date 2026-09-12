// Loaded by @nocobase/plugin-api-doc from the package swagger module.
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Global Search API',
    version: '0.1.0',
    description: 'بحث عابر للمجموعات التي تملك إعداد Global Search مفعلاً.',
  },
  servers: [
    {
      url: '/api',
    },
  ],
  paths: {
    '/globalSearch:search': {
      get: {
        operationId: 'searchGlobally',
        summary: 'البحث في المجموعات المهيأة',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'أقل طول مفيد حرفان؛ القيمة الأقصر تعيد مصفوفة فارغة.',
            schema: {
              type: 'string',
              minLength: 2,
            },
          },
        ],
        responses: {
          '200': {
            description: 'عناصر من المجموعات المفعلة، بحد 20 عنصراً لكل إعداد.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'يلزم تسجيل الدخول',
          },
        },
        'x-nocobase-method-guard': 'لا يتحقق الـ handler من الطريقة؛ GET هو الاستخدام المقصود مع q في query.',
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

export default spec;
