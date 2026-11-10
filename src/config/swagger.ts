export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'UEFA Champions League Archive API v2.0',
    version: '2.0.0',
    description: `API Histórica y Oficial de la UEFA Champions League (1992 - Presente) — Versión 2.0.
Incluye Panel Web Interactivo SuperAdmin en **/admin**, soporte de escudos (\`crest_url\`), fotos de jugadores (\`photo_url\`), roles en plantilla (\`STARTER\`, \`SUBSTITUTE\`, \`RESERVE\`), estados de suspensión/aplazamiento de partidos y las 12 incidencias oficiales de un encuentro.`,
    contact: {
      name: 'UCL Archive Developer Team',
      email: 'dev@ucl-archive.api'
    }
  },
  servers: [
    {
      url: '/',
      description: 'Servidor Actual (Producción / Cloud / Local)'
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local de Desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Pega aquí tu token JWT obtenido en /api/v1/auth/login para acceder a las rutas de SuperAdmin.'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'superAdmin' },
          password: { type: 'string', example: 'admin_ucl_2026' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Autenticación de SuperAdmin exitosa' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      ClubCreate: {
        type: 'object',
        required: ['name', 'short_name', 'country_code', 'stadium'],
        properties: {
          name: { type: 'string', example: 'Real Madrid CF' },
          short_name: { type: 'string', example: 'RMA' },
          country_code: { type: 'string', example: 'ESP' },
          stadium: { type: 'string', example: 'Santiago Bernabéu' },
          titles_count: { type: 'integer', example: 15, default: 0 },
          crest_url: { type: 'string', nullable: true, example: '/uploads/clubs/rma.png' }
        }
      },
      PlayerCreate: {
        type: 'object',
        required: ['first_name', 'last_name', 'nationality', 'position'],
        properties: {
          first_name: { type: 'string', example: 'Kylian' },
          last_name: { type: 'string', example: 'Mbappé' },
          nationality: { type: 'string', example: 'FRA' },
          position: { type: 'string', enum: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'], example: 'Forward' },
          active: { type: 'boolean', example: true, default: true },
          total_goals: { type: 'integer', example: 55, default: 0 },
          total_appearances: { type: 'integer', example: 82, default: 0 },
          photo_url: { type: 'string', nullable: true, example: '/uploads/players/mbappe.png' }
        }
      },
      SeasonCreate: {
        type: 'object',
        required: ['year_start'],
        properties: {
          year_start: { type: 'integer', example: 2024 },
          year_end: { type: 'integer', example: 2025 },
          format: { type: 'string', enum: ['CLASSIC_GROUPS', 'SWISS_LEAGUE'], example: 'SWISS_LEAGUE' },
          teams_count: { type: 'integer', example: 36 },
          champion_id: { type: 'integer', nullable: true, example: null },
          runner_up_id: { type: 'integer', nullable: true, example: null },
          top_scorer_id: { type: 'integer', nullable: true, example: null }
        }
      },
      SeasonUpdate: {
        type: 'object',
        properties: {
          champion_id: { type: 'integer', nullable: true, example: 1 },
          runner_up_id: { type: 'integer', nullable: true, example: 2 },
          top_scorer_id: { type: 'integer', nullable: true, example: 1 }
        }
      },
      SquadCreate: {
        type: 'object',
        required: ['club_id', 'player_id'],
        properties: {
          club_id: { type: 'integer', example: 1 },
          player_id: { type: 'integer', example: 1 },
          season_id: { type: 'integer', nullable: true, example: 1 },
          shirt_number: { type: 'integer', nullable: true, example: 9 },
          role: { type: 'string', enum: ['STARTER', 'SUBSTITUTE', 'RESERVE'], default: 'STARTER' }
        }
      },
      EventCreate: {
        type: 'object',
        required: ['player_id', 'type', 'minute'],
        properties: {
          player_id: { type: 'integer', example: 1 },
          type: {
            type: 'string',
            enum: [
              'GOAL',
              'PENALTY_GOAL',
              'OWN_GOAL',
              'PENALTY_MISSED',
              'ASSIST',
              'YELLOW_CARD',
              'SECOND_YELLOW_RED',
              'RED_CARD',
              'SUBSTITUTION_IN',
              'SUBSTITUTION_OUT',
              'VAR_CANCELLED_GOAL',
              'INJURY'
            ],
            example: 'GOAL'
          },
          minute: { type: 'integer', example: 90 },
          extra_minute: { type: 'integer', nullable: true, example: 4 },
          detail: { type: 'string', nullable: true, example: 'Remate de cabeza al ángulo' }
        }
      },
      MatchCreate: {
        type: 'object',
        required: ['season_id', 'phase_id', 'home_team_id', 'away_team_id', 'match_date', 'stadium'],
        properties: {
          season_id: { type: 'integer', example: 1 },
          phase_id: { type: 'integer', example: 1 },
          matchday: { type: 'integer', example: 1, nullable: true },
          group_name: { type: 'string', example: null, nullable: true },
          home_team_id: { type: 'integer', example: 1 },
          away_team_id: { type: 'integer', example: 2 },
          home_score: { type: 'integer', example: 2, default: 0 },
          away_score: { type: 'integer', example: 1, default: 0 },
          match_date: { type: 'string', format: 'date-time', example: '2024-09-17T19:00:00.000Z' },
          stadium: { type: 'string', example: 'Santiago Bernabéu' },
          status: {
            type: 'string',
            enum: ['FINISHED', 'SUSPENDED', 'POSTPONED', 'RESUMED_AND_FINISHED', 'CANCELLED'],
            default: 'FINISHED'
          },
          suspended_at: { type: 'string', format: 'date-time', nullable: true },
          suspended_minute: { type: 'integer', nullable: true },
          resumed_at: { type: 'string', format: 'date-time', nullable: true },
          suspension_reason: { type: 'string', nullable: true },
          events: {
            type: 'array',
            items: { $ref: '#/components/schemas/EventCreate' }
          }
        }
      },
      PlayerUpdate: {
        type: 'object',
        properties: {
          first_name: { type: 'string', example: 'Kylian' },
          last_name: { type: 'string', example: 'Mbappé' },
          nationality: { type: 'string', example: 'FRA' },
          position: { type: 'string', example: 'Forward' },
          active: { type: 'boolean', example: true },
          total_goals: { type: 'integer', example: 56 },
          total_appearances: { type: 'integer', example: 83 },
          photo_url: { type: 'string', nullable: true, example: '/uploads/players/mbappe.png' }
        }
      }
    }
  },
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Público'],
        summary: 'Estado de salud del API',
        responses: { 200: { description: 'API en línea y saludable' } }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión como SuperAdmin',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Autenticación exitosa',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } }
            }
          },
          401: { description: 'Credenciales incorrectas' }
        }
      }
    },
    '/api/v1/auth/verify': {
      get: {
        tags: ['Autenticación'],
        summary: 'Verificar validez del Token JWT de SuperAdmin',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Token válido' } }
      }
    },
    '/api/v1/upload': {
      post: {
        tags: ['Archivos e Imágenes (SuperAdmin)'],
        summary: 'Subir escudo de club o foto de jugador desde PC (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'folder',
            in: 'query',
            schema: { type: 'string', enum: ['clubs', 'players'], default: 'players' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Imagen subida con éxito' } }
      }
    },
    '/api/v1/admin/reset-database': {
      delete: {
        tags: ['Mantenimiento (SuperAdmin)'],
        summary: 'Vaciar todos los datos de la base de datos para empezar desde cero (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Base de datos vaciada por completo' } }
      }
    },
    '/api/v1/clubs': {
      get: {
        tags: ['Clubes'],
        summary: 'Listar todos los clubes (incluye crest_url)',
        responses: { 200: { description: 'Lista de clubes' } }
      },
      post: {
        tags: ['Clubes (SuperAdmin)'],
        summary: 'Crear un nuevo club con escudo (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ClubCreate' } }
          }
        },
        responses: { 201: { description: 'Club creado exitosamente' } }
      }
    },
    '/api/v1/clubs/{id}': {
      put: {
        tags: ['Clubes (SuperAdmin)'],
        summary: 'Actualizar datos o escudo de un club (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ClubCreate' } }
          }
        },
        responses: { 200: { description: 'Club actualizado' } }
      }
    },
    '/api/v1/players': {
      get: {
        tags: ['Jugadores'],
        summary: 'Listar todos los jugadores (incluye photo_url)',
        responses: { 200: { description: 'Lista de jugadores' } }
      },
      post: {
        tags: ['Jugadores (SuperAdmin)'],
        summary: 'Crear un nuevo jugador con foto (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PlayerCreate' } }
          }
        },
        responses: { 201: { description: 'Jugador creado exitosamente' } }
      }
    },
    '/api/v1/players/top-scorers': {
      get: {
        tags: ['Jugadores'],
        summary: 'Ranking histórico de goleadores (incluye photo_url)',
        parameters: [
          { name: 'active_only', in: 'query', schema: { type: 'boolean' } },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Ranking de goleadores' } }
      }
    },
    '/api/v1/players/{id}': {
      put: {
        tags: ['Jugadores (SuperAdmin)'],
        summary: 'Actualizar estadísticas o foto de jugador (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PlayerUpdate' } }
          }
        },
        responses: { 200: { description: 'Jugador actualizado con éxito' } }
      }
    },
    '/api/v1/seasons': {
      get: {
        tags: ['Temporadas'],
        summary: 'Listar todas las temporadas con fases y cuadro de honor',
        parameters: [
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
        ],
        responses: { 200: { description: 'Lista de temporadas obtenida' } }
      },
      post: {
        tags: ['Temporadas (SuperAdmin)'],
        summary: 'Crear temporada y generar automáticamente sus fases (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SeasonCreate' } }
          }
        },
        responses: { 201: { description: 'Temporada y fases creadas en transacción' } }
      }
    },
    '/api/v1/seasons/{id}': {
      put: {
        tags: ['Temporadas (SuperAdmin)'],
        summary: 'Actualizar campeón, subcampeón y goleador de una temporada (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SeasonUpdate' } }
          }
        },
        responses: { 200: { description: 'Temporada actualizada' } }
      }
    },
    '/api/v1/seasons/{id}/phases': {
      get: {
        tags: ['Temporadas'],
        summary: 'Listar todas las fases de una temporada específica',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Fases de la temporada' } }
      }
    },
    '/api/v1/seasons/{id}/records': {
      get: {
        tags: ['Temporadas'],
        summary: 'Récords y estadísticas de una edición',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Estadísticas calculadas' } }
      }
    },
    '/api/v1/squads': {
      get: {
        tags: ['Plantillas'],
        summary: 'Explorador dinámico de plantillas (?season_id=X&club_id=Y)',
        parameters: [
          { name: 'season_id', in: 'query', schema: { type: 'integer' } },
          { name: 'club_id', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Plantilla con titulares, suplentes y reservas' } }
      },
      post: {
        tags: ['Plantillas (SuperAdmin)'],
        summary: 'Asignar jugador a un club en una temporada con dorsal y rol (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SquadCreate' } }
          }
        },
        responses: { 201: { description: 'Jugador asignado a plantilla' } }
      }
    },
    '/api/v1/squads/{id}': {
      put: {
        tags: ['Plantillas (SuperAdmin)'],
        summary: 'Cambiar rol (STARTER/SUBSTITUTE/RESERVE) o dorsal en plantilla (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Rol actualizado' } }
      },
      delete: {
        tags: ['Plantillas (SuperAdmin)'],
        summary: 'Retirar jugador de la plantilla (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Jugador retirado de la plantilla' } }
      }
    },
    '/api/v1/matches': {
      get: {
        tags: ['Partidos'],
        summary: 'Filtro avanzado de partidos con eventos, fotos y estado de suspensión',
        parameters: [
          { name: 'season', in: 'query', schema: { type: 'string' } },
          { name: 'phase', in: 'query', schema: { type: 'string' } },
          { name: 'team_id', in: 'query', schema: { type: 'integer' } },
          { name: 'matchday', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
        ],
        responses: { 200: { description: 'Partidos encontrados' } }
      },
      post: {
        tags: ['Partidos (SuperAdmin)'],
        summary: 'Registrar partido + estado de suspensión + incidencias en una sola transacción (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/MatchCreate' } }
          }
        },
        responses: { 201: { description: 'Partido e incidencias registrados exitosamente' } }
      }
    },
    '/api/v1/matches/{id}/events': {
      post: {
        tags: ['Partidos (SuperAdmin)'],
        summary: 'Agregar incidencia adicional a un partido existente (Requiere JWT)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/EventCreate' } }
          }
        },
        responses: { 201: { description: 'Incidencia registrada y estadísticas actualizadas' } }
      }
    },
    '/api/v1/head-to-head': {
      get: {
        tags: ['Estadísticas'],
        summary: 'Historial directo entre dos clubes (Head-to-Head) con escudos',
        parameters: [
          { name: 'team1', in: 'query', required: true, schema: { type: 'integer' } },
          { name: 'team2', in: 'query', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Resumen head-to-head calculado' } }
      }
    }
  }
};
