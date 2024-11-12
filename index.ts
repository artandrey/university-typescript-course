interface BaseContent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived';
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
}

interface Article extends BaseContent {
  content: string;
  author: User;
  category: string;
  tags: string[];
  readingTime: number;
  coverImage?: string;
}

interface Product extends BaseContent {
  price: number;
  sku: string;
  inventory: number;
  categories: string[];
  images: string[];
  specifications: Record<string, string>;
}

interface User {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

type Role = 'admin' | 'editor' | 'viewer';

interface Permission {
  resource: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

type AccessControl<T extends BaseContent> = {
  canCreate: (user: User) => boolean;
  canRead: (user: User, content: T) => boolean;
  canUpdate: (user: User, content: T) => boolean;
  canDelete: (user: User, content: T) => boolean;
  getPermissions: (user: User, content: T) => Permission;
};

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  errorMessage: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

type Validator<T> = {
  validate: (data: T) => ValidationResult;
};

class ContentValidator<T extends BaseContent> implements Validator<T> {
  private rules: ValidationRule<T>[];

  constructor(rules: ValidationRule<T>[]) {
    this.rules = rules;
  }

  validate(data: T): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validate(data)) {
        errors.push(rule.errorMessage);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}

interface VersionMetadata {
  version: number;
  changedBy: User;
  changedAt: Date;
  changes: string[];
}

type Versioned<T extends BaseContent> = T & {
  version: number;
  previousVersions: Array<T & VersionMetadata>;
  revertToVersion: (version: number) => T;
  getVersionHistory: () => VersionMetadata[];
};

interface ContentOperations<T extends BaseContent> {
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<boolean>;
  list: (filters?: Partial<T>) => Promise<T[]>;
  publish: (id: string) => Promise<T>;
  archive: (id: string) => Promise<T>;
}

type ContentType = 'article' | 'product';

interface ContentTypeMap {
  article: Article;
  product: Product;
}

type GetContentType<T extends ContentType> = ContentTypeMap[T];

const articleValidator = new ContentValidator<Article>([
  {
    validate: (article) => article.title.length >= 3,
    errorMessage: 'Title must be at least 3 characters long',
  },
  {
    validate: (article) => article.content.length >= 100,
    errorMessage: 'Content must be at least 100 characters long',
  },
]);

function createBaseAccessControl<T extends BaseContent>(
  resourceType: string
): AccessControl<T> {
  const hasPermission = (
    user: User,
    action: keyof Permission['actions']
  ): boolean => {
    return user.permissions.some(
      (permission) =>
        permission.resource === resourceType && permission.actions[action]
    );
  };

  return {
    canCreate: (user: User): boolean => {
      return hasPermission(user, 'create');
    },

    canRead: (user: User, content: T): boolean => {
      if (user.role === 'admin') return true;
      if (content.status === 'archived' && user.role === 'viewer') return false;
      return hasPermission(user, 'read');
    },

    canUpdate: (user: User, content: T): boolean => {
      if (user.role === 'admin') return true;
      if (content.status === 'archived') return false;
      return hasPermission(user, 'update');
    },

    canDelete: (user: User, content: T): boolean => {
      if (user.role === 'admin') return true;
      if (content.status === 'published') return user.role === 'editor';
      return hasPermission(user, 'delete');
    },

    getPermissions: (user: User, content: T): Permission => ({
      resource: resourceType,
      actions: {
        create: hasPermission(user, 'create'),
        read:
          content.status === 'archived' && user.role === 'viewer'
            ? false
            : hasPermission(user, 'read'),
        update:
          content.status === 'archived' ? false : hasPermission(user, 'update'),
        delete:
          content.status === 'published'
            ? user.role === 'admin'
            : hasPermission(user, 'delete'),
      },
    }),
  };
}

function createArticleAccessControl(): AccessControl<Article> {
  const baseControl = createBaseAccessControl<Article>('article');

  return {
    ...baseControl,
    canUpdate: (user: User, content: Article): boolean => {
      const baseCanUpdate = baseControl.canUpdate(user, content);
      if (!baseCanUpdate) return false;

      if (user.role === 'editor') {
        return content.author.id === user.id;
      }
      return true;
    },
  };
}

function createProductAccessControl(): AccessControl<Product> {
  const baseControl = createBaseAccessControl<Product>('product');

  return {
    ...baseControl,
    canUpdate: (user: User, content: Product): boolean => {
      const baseCanUpdate = baseControl.canUpdate(user, content);
      if (!baseCanUpdate) return false;

      if (user.role === 'editor') {
        return true;
      }
      return true;
    },
  };
}

const articleAccess = createArticleAccessControl();
const productAccess = createProductAccessControl();

console.log('Running test scenarios...');

const adminUser: User = {
  id: '1',
  email: 'admin@example.com',
  role: 'admin',
  permissions: [
    {
      resource: 'article',
      actions: { create: true, read: true, update: true, delete: true },
    },
  ],
};

const editorUser: User = {
  id: '2',
  email: 'editor@example.com',
  role: 'editor',
  permissions: [
    {
      resource: 'article',
      actions: { create: true, read: true, update: true, delete: true },
    },
  ],
};

const viewerUser: User = {
  id: '3',
  email: 'viewer@example.com',
  role: 'viewer',
  permissions: [
    {
      resource: 'article',
      actions: { create: false, read: true, update: false, delete: false },
    },
  ],
};

const testArticle: Article = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'published',
  title: 'Test Article',
  content:
    'This is a test article with more than 100 characters to pass validation. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  author: editorUser,
  category: 'test',
  tags: ['test'],
  readingTime: 5,
  metadata: {},
};

const archivedArticle: Article = {
  ...testArticle,
  id: '2',
  status: 'archived',
};

console.assert(
  articleAccess.canRead(adminUser, testArticle) === true,
  'Admin should be able to read published articles'
);

console.assert(
  articleAccess.canRead(viewerUser, archivedArticle) === false,
  'Viewer should not be able to read archived articles'
);

console.assert(
  articleAccess.canUpdate(editorUser, testArticle) === true,
  'Editor should be able to update their own article'
);

console.assert(
  articleAccess.canDelete(viewerUser, testArticle) === false,
  'Viewer should not be able to delete articles'
);

const invalidArticle: Article = {
  ...testArticle,
  title: 'A',
  content: 'Too short content',
};

const validationResult = articleValidator.validate(testArticle);
const invalidValidationResult = articleValidator.validate(invalidArticle);

console.assert(
  validationResult.isValid === true,
  'Valid article should pass validation'
);

console.assert(
  invalidValidationResult.isValid === false,
  'Invalid article should fail validation'
);

console.assert(
  invalidValidationResult.errors.length === 2,
  'Invalid article should have 2 validation errors'
);

const testProduct: Product = {
  id: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'published',
  title: 'Test Product',
  price: 99.99,
  sku: 'TEST123',
  inventory: 100,
  categories: ['test'],
  images: ['test.jpg'],
  specifications: { color: 'red' },
  metadata: {},
};

console.assert(
  productAccess.canUpdate(editorUser, testProduct) === true,
  'Editor should be able to update any product'
);

console.assert(
  productAccess.canDelete(viewerUser, testProduct) === false,
  'Viewer should not be able to delete products'
);
