type BaseProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  inStock: boolean;
};

type Electronics = BaseProduct & {
  category: 'electronics';
  brand: string;
  warranty: number;
  powerConsumption: number;
};

type Clothing = BaseProduct & {
  category: 'clothing';
  size: string;
  color: string;
  material: string;
};

type Book = BaseProduct & {
  category: 'book';
  author: string;
  isbn: string;
  pages: number;
};

type CartItem<T extends BaseProduct> = {
  product: T;
  quantity: number;
};

const findProduct = <T extends BaseProduct>(
  products: T[],
  id: number
): T | undefined => {
  return products.find((product) => product.id === id);
};

const filterByPrice = <T extends BaseProduct>(
  products: T[],
  maxPrice: number
): T[] => {
  if (maxPrice < 0) throw new Error('Price cannot be negative');
  return products.filter((product) => product.price <= maxPrice);
};

const addToCart = <T extends BaseProduct>(
  cart: CartItem<T>[],
  product: T,
  quantity: number
): CartItem<T>[] => {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');
  if (!product.inStock) throw new Error('Product is out of stock');

  const existingItem = cart.find((item) => item.product.id === product.id);

  if (existingItem) {
    return cart.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }

  return [...cart, { product, quantity }];
};

const calculateTotal = <T extends BaseProduct>(cart: CartItem<T>[]): number => {
  return cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

const electronics: Electronics[] = [
  {
    id: 1,
    name: 'iPhone 13',
    price: 30000,
    description: 'Smartphone Apple',
    inStock: true,
    category: 'electronics',
    brand: 'Apple',
    warranty: 12,
    powerConsumption: 20,
  },
  {
    id: 2,
    name: 'Samsung TV',
    price: 15000,
    description: 'Smart TV',
    inStock: true,
    category: 'electronics',
    brand: 'Samsung',
    warranty: 24,
    powerConsumption: 100,
  },
];

const clothing: Clothing[] = [
  {
    id: 3,
    name: 'Jeans',
    price: 1500,
    description: 'Classic jeans',
    inStock: true,
    category: 'clothing',
    size: 'L',
    color: 'Blue',
    material: 'Denim',
  },
];

const phone = findProduct(electronics, 1);
if (phone) {
  const cart: CartItem<Electronics>[] = [];
  const updatedCart = addToCart(cart, phone, 2);
  const total = calculateTotal(updatedCart);
  console.log('Total:', total);
}

const affordableProducts = filterByPrice(electronics, 20000);
console.log('Affordable products:', affordableProducts);
