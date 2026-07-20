import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AuthService, AuthErrorException } from '../auth/auth.service';
import { CollectionsService } from '../collections/collections.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { CheckoutService } from '../checkout/checkout.service';
import { OrdersService } from '../orders/orders.service';
import { ArticlesService } from '../articles/articles.service';
import { ProductVariantEntity, CountryEntity, AddressEntity } from '@app/database';

interface ExecuteOptions {
  token?: string;
  languageCode?: string;
  currencyCode?: string;
  channelToken?: string;
}

interface ExecuteResult {
  data: Record<string, unknown>;
  headers?: Record<string, string>;
}

@Injectable()
export class ShopApiService {
  private readonly logger = new Logger(ShopApiService.name);

  constructor(
    private authService: AuthService,
    private collectionsService: CollectionsService,
    private productsService: ProductsService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private ordersService: OrdersService,
    private articlesService: ArticlesService,
    @InjectRepository(ProductVariantEntity)
    private variantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(CountryEntity)
    private countryRepo: Repository<CountryEntity>,
    @InjectRepository(AddressEntity)
    private addressRepo: Repository<AddressEntity>,
  ) {}

  async execute(
    query: string,
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const opName = this.extractOperationName(query);
    if (!opName) {
      return { data: {} };
    }

    try {
      switch (opName) {
        // ─── Auth ───
        case 'Login': return await this.handleLogin(variables);
        case 'Logout': return await this.handleLogout(variables, options);
        case 'RegisterCustomerAccount': return await this.handleRegister(variables, options);
        case 'VerifyCustomerAccount': return await this.handleVerify(variables, options);
        case 'RequestPasswordReset': return await this.handleRequestPasswordReset(variables);
        case 'ResetPassword': return await this.handleResetPassword(variables);
        case 'UpdateCustomerPassword': return await this.handleUpdatePassword(variables, options);
        case 'UpdateCustomer': return await this.handleUpdateCustomer(variables, options);
        case 'RequestUpdateCustomerEmailAddress': return await this.handleRequestEmailChange(variables, options);
        case 'UpdateCustomerEmailAddress': return await this.handleUpdateEmail(variables);
        case 'GetActiveCustomer': return await this.handleGetActiveCustomer(options);
        case 'GetActiveChannel': return await this.handleGetActiveChannel();

        // ─── Collections ───
        case 'GetTopCollections': return await this.handleGetTopCollections(variables, options);
        case 'GetCollectionProducts': return await this.handleGetCollectionProducts(variables, options);

        // ─── Products ───
        case 'SearchProducts': return await this.handleSearchProducts(variables, options);
        case 'GetProductDetail': return await this.handleGetProductDetail(variables, options);

        // ─── Cart ───
        case 'GetActiveOrder': return await this.handleGetActiveOrder(options);
        case 'GetActiveOrderForCheckout': return await this.handleGetActiveOrderForCheckout(options);
        case 'AddToCart': return await this.handleAddToCart(variables, options);
        case 'RemoveFromCart': return await this.handleRemoveFromCart(variables, options);
        case 'AdjustCartItem': return await this.handleAdjustCartItem(variables, options);
        case 'ApplyPromotionCode': return await this.handleApplyPromotionCode(variables, options);
        case 'RemovePromotionCode': return await this.handleRemovePromotionCode(variables, options);

        // ─── Checkout ───
        case 'GetEligibleShippingMethods': return await this.handleGetEligibleShippingMethods(options);
        case 'GetEligiblePaymentMethods': return await this.handleGetEligiblePaymentMethods(options);
        case 'SetOrderShippingAddress': return await this.handleSetOrderShippingAddress(variables, options);
        case 'SetOrderBillingAddress': return await this.handleSetOrderBillingAddress(variables, options);
        case 'SetOrderShippingMethod': return await this.handleSetOrderShippingMethod(variables, options);
        case 'SetCustomerForOrder': return await this.handleSetCustomerForOrder(variables, options);
        case 'TransitionOrderToState': return await this.handleTransitionOrderToState(variables, options);
        case 'AddPaymentToOrder': return await this.handleAddPaymentToOrder(variables, options);

        // ─── Orders ───
        case 'GetCustomerOrders': return await this.handleGetCustomerOrders(variables, options);
        case 'GetOrderDetail': return await this.handleGetOrderDetail(variables, options);
        case 'GetOrderByCode': return await this.handleGetOrderByCode(variables, options);

        // ─── Addresses ───
        case 'GetCustomerAddresses': return await this.handleGetCustomerAddresses(options);
        case 'CreateCustomerAddress': return await this.handleCreateCustomerAddress(variables, options);
        case 'UpdateCustomerAddress': return await this.handleUpdateCustomerAddress(variables, options);
        case 'DeleteCustomerAddress': return await this.handleDeleteCustomerAddress(variables, options);

        // ─── Articles ───
        case 'GetArticles': return await this.handleGetArticles(variables, options);
        case 'GetArticleBySlug': return await this.handleGetArticleBySlug(variables, options);
        case 'GetArticleCategories': return await this.handleGetArticleCategories(options);
        case 'GetArticleTags': return await this.handleGetArticleTags(options);

        // ─── Reference ───
        case 'GetAvailableCountries': return await this.handleGetAvailableCountries(options);

        default:
          this.logger.warn(`Unknown operation: ${opName}`);
          return { data: {} };
      }
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult(opName, e.errorCode, e.message);
      }
      this.logger.error(`Error handling ${opName}:`, e);
      return this.errorResult(opName, 'INTERNAL_ERROR', 'An unexpected error occurred');
    }
  }

  private extractOperationName(query: string): string | undefined {
    const match = query.match(/^\s*(?:query|mutation)\s+(\w+)/m);
    return match?.[1];
  }

  private errorResult(operation: string, errorCode: string, message: string): ExecuteResult {
    return {
      data: {
        [this.camelCase(operation)]: {
          __typename: 'ErrorResult',
          errorCode,
          message,
        },
      },
    };
  }

  private successResult(operation: string): ExecuteResult {
    return {
      data: {
        [this.camelCase(operation)]: {
          __typename: 'Success',
          success: true,
        },
      },
    };
  }

  private camelCase(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  // ─── Auth Handlers ───

  private async handleLogin(variables: Record<string, unknown>): Promise<ExecuteResult> {
    const username = (variables.username || variables.email) as string;
    const password = variables.password as string;
    try {
      const result = await this.authService.login({ email: username, password });
      return {
        data: {
          login: {
            __typename: 'CurrentUser',
            id: result.user.id,
            identifier: result.user.identifier,
          },
        },
        headers: { 'vendure-auth-token': result.token },
      };
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return {
          data: {
            login: {
              __typename: e.errorCode === 'INVALID_CREDENTIALS' ? 'InvalidCredentialsError' : 'NotVerifiedError',
              errorCode: e.errorCode,
              message: e.message,
            },
          },
        };
      }
      throw e;
    }
  }

  private async handleLogout(
    _variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    if (!options.token) {
      return this.errorResult('logout', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    await this.authService.logout(options.token);
    return this.successResult('logout');
  }

  private async handleRegister(
    variables: Record<string, unknown>,
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const input = variables.input as Record<string, unknown> || variables;
    try {
      await this.authService.register({
        email: input.emailAddress as string,
        password: input.password as string,
        firstName: input.firstName as string | undefined,
        lastName: input.lastName as string | undefined,
        phone: input.phoneNumber as string | undefined,
      });
      return this.successResult('registerCustomerAccount');
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return {
          data: {
            registerCustomerAccount: {
              __typename: e.errorCode === 'EMAIL_ALREADY_REGISTERED'
                ? 'EmailAddressConflictError' : 'ErrorResult',
              errorCode: e.errorCode,
              message: e.message,
            },
          },
        };
      }
      throw e;
    }
  }

  private async handleVerify(
    variables: Record<string, unknown>,
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const token = variables.token as string;
    try {
      const user = await this.authService.getUserFromToken(token);
      if (user) {
        return {
          data: {
            verifyCustomerAccount: {
              __typename: 'CurrentUser',
              id: user.id,
              identifier: user.email,
            },
          },
        };
      }
      return this.successResult('verifyCustomerAccount');
    } catch (e: any) {
      this.logger.warn(`verifyCustomerAccount failed: ${e.message}`);
      return this.successResult('verifyCustomerAccount');
    }
  }

  private async handleRequestPasswordReset(
    variables: Record<string, unknown>,
  ): Promise<ExecuteResult> {
    const emailAddress = variables.emailAddress as string;
    try {
      await this.authService.forgotPassword({ email: emailAddress });
      return this.successResult('requestPasswordReset');
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult('requestPasswordReset', e.errorCode, e.message);
      }
      throw e;
    }
  }

  private async handleResetPassword(
    variables: Record<string, unknown>,
  ): Promise<ExecuteResult> {
    const token = variables.token as string;
    const password = variables.password as string;
    try {
      const result = await this.authService.resetPassword({ token, password });
      return {
        data: {
          resetPassword: {
            __typename: 'CurrentUser',
            id: result.user.id,
            identifier: result.user.identifier,
          },
        },
        headers: { 'vendure-auth-token': result.token },
      };
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult('resetPassword', e.errorCode, e.message);
      }
      throw e;
    }
  }

  private async handleUpdatePassword(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    if (!options.token) {
      return this.errorResult('updateCustomerPassword', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    try {
      await this.authService.changePassword(options.token, {
        currentPassword: variables.currentPassword as string,
        newPassword: variables.newPassword as string,
      });
      return this.successResult('updateCustomerPassword');
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult('updateCustomerPassword', e.errorCode, e.message);
      }
      throw e;
    }
  }

  private async handleUpdateCustomer(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    if (!options.token) {
      return this.errorResult('updateCustomer', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    const input = variables.input as Record<string, unknown>;
    const user = await this.authService.getUserFromToken(options.token);
    if (!user) {
      return this.errorResult('updateCustomer', 'NOT_AUTHENTICATED', 'Invalid token');
    }
    try {
      const profile = await this.authService.updateProfile(user.id, {
        firstName: input.firstName as string,
        lastName: input.lastName as string,
        phone: input.phoneNumber as string,
      });
      return {
        data: {
          updateCustomer: {
            __typename: 'Customer',
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            emailAddress: profile.email,
            phoneNumber: profile.phone,
          },
        },
      };
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult('updateCustomer', e.errorCode, e.message);
      }
      throw e;
    }
  }

  private async handleRequestEmailChange(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    if (!options.token) {
      return this.errorResult('requestUpdateCustomerEmailAddress', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    try {
      await this.authService.changeEmail(options.token, {
        password: variables.password as string,
        newEmailAddress: variables.newEmailAddress as string,
      });
      return this.successResult('requestUpdateCustomerEmailAddress');
    } catch (e) {
      if (e instanceof AuthErrorException) {
        return this.errorResult('requestUpdateCustomerEmailAddress', e.errorCode, e.message);
      }
      throw e;
    }
  }

  private async handleUpdateEmail(
    variables: Record<string, unknown>,
  ): Promise<ExecuteResult> {
    try {
      await this.authService.verifyEmailChange(variables.token as string);
      return this.successResult('updateCustomerEmailAddress');
    } catch (e: any) {
      this.logger.warn(`updateCustomerEmailAddress failed: ${e.message}`);
      return this.successResult('updateCustomerEmailAddress');
    }
  }

  private async handleGetActiveCustomer(
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    if (!options.token) {
      return { data: { activeCustomer: null } };
    }
    const user = await this.authService.getUserFromToken(options.token);
    if (!user) {
      return { data: { activeCustomer: null } };
    }
    const profile = await this.authService.getProfile(user.id);
    if (!profile) {
      return { data: { activeCustomer: null } };
    }
    return {
      data: {
        activeCustomer: {
          __typename: 'Customer',
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          emailAddress: profile.email,
          phoneNumber: profile.phone,
        },
      },
    };
  }

  private async handleGetActiveChannel(): Promise<ExecuteResult> {
    return {
      data: {
        activeChannel: {
          id: '1',
          code: '__default_channel__',
          defaultLanguageCode: 'en',
          availableLanguageCodes: ['en', 'vi', 'de'],
          defaultCurrencyCode: 'VND',
          availableCurrencyCodes: ['VND', 'USD'],
        },
      },
    };
  }

  // ─── Collections Handlers ───

  private async handleGetTopCollections(
    _variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const result = await this.collectionsService.findAll({ limit: 200 });
    const mapCat = (cat: any): Record<string, unknown> => ({
      id: cat.id,
      name: cat.name?.[options.languageCode ?? 'en'] ?? cat.name?.en ?? '',
      slug: cat.slug,
      children: cat.children?.map(mapCat) ?? [],
    });
    const items = result.items.map(mapCat);
    return {
      data: {
        collections: { items },
      },
    };
  }

  private async handleGetCollectionProducts(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const slug = variables.slug as string;
    const input = (variables.input || {}) as Record<string, unknown>;
    const groupByPrice = input.groupByPrice as string;

    try {
      const collection = await this.collectionsService.findBySlug(slug);
      const locale = options.languageCode ?? 'en';

      const collectionData = {
        id: collection.id,
        name: collection.name?.[locale] ?? collection.name?.en ?? '',
        slug: collection.slug,
        description: collection.description?.[locale] ?? collection.description?.en ?? '',
        featuredAsset: collection.imageUrl ? {
          id: collection.id,
          preview: collection.imageUrl,
        } : null,
      };

      // Reuse products service for search within collection
      const skip = Number(input.skip) || 0;
      const take = Number(input.take) || 12;
      const products = await this.productsService.findAll({
        categorySlug: slug,
        page: Math.floor(skip / take) + 1,
        limit: take,
        sort: this.normalizeSort(input.sort),
      });

      const items = products.items.map((p: any) => this.mapSearchResultItem(p, locale));

      return {
        data: {
          collection: collectionData,
          search: {
            totalItems: products.total,
            items,
          },
        },
      };
    } catch (e: any) {
      if (e.name === 'NotFoundException') {
        return { data: { collection: null, search: { totalItems: 0, items: [] } } };
      }
      this.logger.error(`Error in handleGetCollectionProducts:`, e);
      return { data: { collection: null, search: { totalItems: 0, items: [] } } };
    }
  }

  // ─── Products Handlers ───

  private async handleSearchProducts(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const input = (variables.input || {}) as Record<string, unknown>;
    const locale = options.languageCode ?? 'en';

    try {
      const skip = Number(input.skip) || 0;
      const take = Number(input.take) || 12;
      const products = await this.productsService.findAll({
        search: input.search as string,
        categorySlug: (input.collectionSlug ?? input.categorySlug) as string,
        brandSlug: input.brandSlug as string,
        minPrice: input.minPrice as number,
        maxPrice: input.maxPrice as number,
        page: Math.floor(skip / take) + 1,
        limit: take,
        sort: this.normalizeSort(input.sort),
      });

      const items = products.items.map((p: any) => this.mapSearchResultItem(p, locale));

      return {
        data: {
          search: {
            totalItems: products.total,
            items,
            facetValues: [],
          },
        },
      };
    } catch (e) {
      this.logger.error(`Error in handleSearchProducts:`, e);
      return {
        data: {
          search: {
            totalItems: 0,
            items: [],
            facetValues: [],
          },
        },
      };
    }
  }

  private async handleGetProductDetail(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const slug = variables.slug as string;
    const locale = options.languageCode ?? 'en';

    try {
      const product = await this.productsService.findBySlug(slug);
      return {
        data: {
          product: this.mapProductDetail(product, locale),
        },
      };
    } catch (e: any) {
      if (e.name === 'NotFoundException') {
        return { data: { product: null } };
      }
      throw e;
    }
  }

  private mapSearchResultItem(p: any, locale: string): Record<string, unknown> {
    const basePrice = Number(p.basePrice ?? p.base_price ?? 0);
    const taxRate = Number(p.taxRate ?? p.tax_rate ?? 0);
    const priceWithTax = basePrice * (1 + taxRate / 100);

    const firstImage = p.images?.[0];

    return {
      productId: p.id,
      productName: p.name?.[locale] ?? p.name?.en ?? '',
      slug: p.slug,
      sortDescription: p.sortDescription?.[locale] ?? p.sortDescription?.en ?? '',
      productAsset: firstImage ? {
        id: firstImage.id,
        preview: firstImage.url ?? firstImage.preview,
      } : null,
      priceWithTax: {
        __typename: 'SinglePrice',
        value: priceWithTax,
      },
      currencyCode: 'VND',
    };
  }

  private mapProductDetail(product: any, locale: string): Record<string, unknown> {
    const images = (product.images ?? []).map((img: any) => ({
      id: img.id,
      preview: img.url ?? img.preview,
      source: img.url ?? img.source,
    }));

    const asset = images[0] ?? null;

    const variants = (product.variants ?? []).map((v: any) => {
      const price = Number(v.price ?? 0);
      const taxRate = Number(v.taxRate ?? v.tax_rate ?? 0);
      const priceWithTax = price * (1 + taxRate / 100);
      const stockLevel = 'IN_STOCK';

      const options = (v.variantOptions ?? []).map((vo: any) => ({
        id: vo.option?.id ?? vo.id,
        code: vo.option?.code ?? '',
        name: vo.option?.name?.[locale] ?? vo.option?.name?.en ?? '',
        groupId: vo.option?.groupId ?? vo.groupId,
      }));

      return {
        id: v.id,
        name: v.name?.[locale] ?? v.name?.en ?? '',
        sku: v.sku,
        priceWithTax,
        stockLevel,
        options,
      };
    });

    const optionGroups = (product.optionGroups ?? []).map((g: any) => ({
      id: g.id,
      code: g.code ?? '',
      name: g.name?.[locale] ?? g.name?.en ?? '',
      options: (g.options ?? []).map((o: any) => ({
        id: o.id,
        code: o.code ?? '',
        name: o.name?.[locale] ?? o.name?.en ?? '',
      })),
    }));

    const collections = product.category
      ? [{
          id: product.category.id,
          name: product.category.name?.[locale] ?? product.category.name?.en ?? '',
          slug: product.category.slug,
          parent: product.category.parentId ? { id: product.category.parentId } : null,
        }]
      : [];

    return {
      id: product.id,
      name: product.name?.[locale] ?? product.name?.en ?? '',
      description: product.description?.[locale] ?? product.description?.en ?? '',
      sortDescription: product.sortDescription?.[locale] ?? product.sortDescription?.en ?? '',
      detail: product.detail?.[locale] ?? product.detail?.en ?? '',
      slug: product.slug,
      assets: images,
      featuredAsset: asset,
      variants,
      optionGroups,
      collections,
    };
  }

  // ─── Cart Handlers ───

  private async handleGetActiveOrder(
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { activeOrder: null } };
    }
    try {
      const cart = await this.cartService.getCart(userId);
      return { data: { activeOrder: this.mapCartToOrder(cart) } };
    } catch {
      this.logger.warn('GetActiveOrder failed');
      return { data: { activeOrder: null } };
    }
  }

  private async handleGetActiveOrderForCheckout(
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { activeOrder: null } };
    }
    try {
      const cart = await this.cartService.getCart(userId);
      const order = this.mapCartToOrder(cart);
      return {
        data: {
          activeOrder: {
            ...order,
            customer: null,
            shippingAddress: null,
            billingAddress: null,
            shippingLines: [],
          },
        },
      };
    } catch {
      this.logger.warn('GetActiveOrderForCheckout failed');
      return { data: { activeOrder: null } };
    }
  }

  private async handleAddToCart(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { addItemToOrder: null } };
    }
    const variantId = variables.variantId as string;
    const quantity = (variables.quantity ?? 1) as number;

    // Resolve productId from variant
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
      select: ['id', 'productId'],
    });
    if (!variant) {
      return this.errorResult('addItemToOrder', 'VARIANT_NOT_FOUND', 'Variant not found');
    }

    try {
      const cart = await this.cartService.addItem(
        { variantId, quantity, productId: variant.productId },
        userId,
      );
      return { data: { addItemToOrder: this.mapCartToOrder(cart) } };
    } catch (e: any) {
      if (e.name === 'BadRequestException' || e.name === 'NotFoundException') {
        return this.errorResult('addItemToOrder', 'BAD_REQUEST', e.message);
      }
      throw e;
    }
  }

  private async handleRemoveFromCart(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return this.errorResult('removeOrderLine', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    const lineId = variables.lineId as string;
    try {
      const cart = await this.cartService.removeItem(lineId, userId);
      return { data: { removeOrderLine: this.mapCartToOrder(cart) } };
    } catch (e: any) {
      if (e.name === 'NotFoundException') {
        return this.errorResult('removeOrderLine', 'ITEM_NOT_FOUND', 'Cart item not found');
      }
      throw e;
    }
  }

  private async handleAdjustCartItem(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return this.errorResult('adjustOrderLine', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    const lineId = variables.lineId as string;
    const quantity = variables.quantity as number;
    try {
      const cart = await this.cartService.updateItem(lineId, { quantity }, userId);
      return { data: { adjustOrderLine: this.mapCartToOrder(cart) } };
    } catch (e: any) {
      if (e.name === 'NotFoundException') {
        return this.errorResult('adjustOrderLine', 'ITEM_NOT_FOUND', 'Cart item not found');
      }
      return this.errorResult('adjustOrderLine', 'BAD_REQUEST', e.message);
    }
  }

  private async handleApplyPromotionCode(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return this.errorResult('applyCouponCode', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    const couponCode = variables.couponCode as string;
    try {
      const cart = await this.cartService.addCoupon(couponCode, userId);
      return { data: { applyCouponCode: this.mapCartToOrder(cart) } };
    } catch (e: any) {
      this.logger.warn(`applyCouponCode failed: ${e.message}`);
      return this.errorResult('applyCouponCode', 'COUPON_INVALID', 'Invalid coupon code');
    }
  }

  private async handleRemovePromotionCode(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return this.errorResult('removeCouponCode', 'NOT_AUTHENTICATED', 'Not authenticated');
    }
    const couponCode = variables.couponCode as string;
    try {
      const cart = await this.cartService.removeCoupon(couponCode, userId);
      return { data: { removeCouponCode: this.mapCartToOrder(cart) } };
    } catch (e: any) {
      this.logger.warn(`removeCouponCode failed: ${e.message}`);
      return { data: { removeCouponCode: null } };
    }
  }

  // ─── Cart Helpers ───

  private async resolveUserId(token?: string): Promise<string | null> {
    if (!token) return null;
    const user = await this.authService.getUserFromToken(token);
    return user?.id ?? null;
  }

  private mapCartToOrder(cart: any): Record<string, unknown> | null {
    if (!cart) return null;
    const totals = cart.totals ?? { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, grandTotal: 0 };

    const lines = (cart.items ?? []).map((item: any) => {
      const unitPriceWithTax = Number(item.unitPrice ?? 0);
      const linePriceWithTax = unitPriceWithTax * Number(item.quantity ?? 0);
      const productName = typeof item.productName === 'object'
        ? (item.productName?.en ?? item.productName?.vi ?? '')
        : (item.productName ?? '');

      return {
        id: item.id,
        productVariant: {
          id: item.variantId,
          name: typeof item.variantName === 'object'
            ? (item.variantName?.en ?? item.variantName?.vi ?? '')
            : (item.variantName ?? ''),
          sku: item.sku ?? '',
          product: {
            id: item.productId,
            name: productName,
            slug: item.productSlug ?? '',
            featuredAsset: item.image ? { id: item.variantId, preview: item.image } : null,
          },
        },
        unitPriceWithTax,
        quantity: Number(item.quantity ?? 0),
        linePriceWithTax,
      };
    });

    return {
      __typename: 'Order',
      id: cart.id,
      code: cart.id?.substring(0, 8)?.toUpperCase() ?? '',
      state: 'Active',
      totalQuantity: lines.reduce((s: number, l: any) => s + l.quantity, 0),
      subTotal: totals.subtotal,
      subTotalWithTax: totals.subtotal,
      shipping: totals.shippingTotal,
      shippingWithTax: totals.shippingTotal,
      total: totals.grandTotal,
      totalWithTax: totals.grandTotal,
      currencyCode: 'VND',
      couponCodes: (cart.coupons ?? []).map((c: any) => c.couponCode),
      discounts: (cart.coupons ?? []).map((c: any) => ({
        description: c.couponCode,
        amountWithTax: c.discountAmount,
      })),
      lines,
    };
  }

  // ─── Checkout Handlers ───

  private async handleGetEligibleShippingMethods(
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const result = this.checkoutService.getShippingMethods();
    return {
      data: {
        eligibleShippingMethods: result.methods.map((m, i) => ({
          id: String(i + 1),
          name: m.name,
          code: m.code,
          description: '',
          priceWithTax: m.price,
        })),
      },
    };
  }

  private async handleGetEligiblePaymentMethods(
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const result = this.checkoutService.getPaymentMethods();
    return {
      data: {
        eligiblePaymentMethods: result.methods.map((m, i) => ({
          id: String(i + 1),
          name: m.name,
          code: m.code,
          description: '',
          isEligible: true,
          eligibilityMessage: '',
        })),
      },
    };
  }

  private async handleSetOrderShippingAddress(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    const input = (variables.input ?? {}) as Record<string, unknown>;
    try {
      await this.checkoutService.setShippingAddress(
        this.mapAddressInput(input),
        userId ?? undefined,
      );
      const cart = await this.cartService.getCart(userId ?? undefined);
      return {
        data: {
          setOrderShippingAddress: {
            __typename: 'Order',
            ...this.mapCartToOrder(cart),
            shippingAddress: this.mapAddressToGraphQL(input),
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`setOrderShippingAddress failed: ${e.message}`);
      return { data: { setOrderShippingAddress: null } };
    }
  }

  private async handleSetOrderBillingAddress(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    const input = (variables.input ?? {}) as Record<string, unknown>;
    try {
      await this.checkoutService.setBillingAddress(
        this.mapAddressInput(input),
        userId ?? undefined,
      );
      const cart = await this.cartService.getCart(userId ?? undefined);
      return {
        data: {
          setOrderBillingAddress: {
            __typename: 'Order',
            ...this.mapCartToOrder(cart),
            billingAddress: this.mapAddressToGraphQL(input),
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`setOrderBillingAddress failed: ${e.message}`);
      return { data: { setOrderBillingAddress: null } };
    }
  }

  private async handleSetOrderShippingMethod(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    const methodIds = variables.shippingMethodId as string[] ?? [];
    const code = methodIds[0] ?? 'standard';
    try {
      await this.checkoutService.setShippingMethod(code, userId ?? undefined);
      const cart = await this.cartService.getCart(userId ?? undefined);
      return {
        data: {
          setOrderShippingMethod: {
            __typename: 'Order',
            ...this.mapCartToOrder(cart),
            shippingLines: [{
              shippingMethod: { id: methodIds[0] ?? '1', name: code, description: '' },
              priceWithTax: 0,
            }],
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`setOrderShippingMethod failed: ${e.message}`);
      return { data: { setOrderShippingMethod: null } };
    }
  }

  private async handleSetCustomerForOrder(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    const input = (variables.input ?? {}) as Record<string, unknown>;
    try {
      const result = await this.checkoutService.setCustomer(
        {
          email: (input.emailAddress ?? '') as string,
          firstName: (input.firstName ?? '') as string,
          lastName: (input.lastName ?? '') as string,
          phone: (input.phoneNumber ?? '') as string,
        },
        userId ?? undefined,
      );
      return {
        data: {
          setCustomerForOrder: {
            __typename: 'Order',
            id: '',
            code: '',
            customer: {
              id: userId ?? '',
              firstName: input.firstName as string,
              lastName: input.lastName as string,
              emailAddress: input.emailAddress as string,
              phoneNumber: input.phoneNumber as string,
            },
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`setCustomerForOrder failed: ${e.message}`);
      return { data: { setCustomerForOrder: null } };
    }
  }

  private async handleTransitionOrderToState(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const state = variables.state as string;
    const userId = await this.resolveUserId(options.token);
    try {
      const cart = await this.cartService.getCart(userId ?? undefined);
      const order = this.mapCartToOrder(cart);
      return {
        data: {
          transitionOrderToState: {
            __typename: 'Order',
            ...(order ? { id: order.id, code: order.code, state } : { id: '', code: '', state }),
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`transitionOrderToState failed: ${e.message}`);
      return {
        data: {
          transitionOrderToState: {
            __typename: 'Order',
            id: '',
            code: '',
            state,
          },
        },
      };
    }
  }

  private async handleAddPaymentToOrder(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    const input = (variables.input ?? {}) as Record<string, unknown>;
    const method = (input.method ?? 'cod') as string;
    try {
      await this.checkoutService.setPayment(method, userId ?? undefined);
      const order = await this.checkoutService.confirm(userId ?? undefined);
      return { data: { addPaymentToOrder: this.mapOrderToGraphQL(order) } };
    } catch (e: any) {
      return {
        data: {
          addPaymentToOrder: {
            __typename: 'ErrorResult',
            errorCode: 'ORDER_FAILED',
            message: e.message ?? 'Order placement failed',
          },
        },
      };
    }
  }

  // ─── Order Handlers ───

  private async handleGetCustomerOrders(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { activeCustomer: { id: '', orders: { totalItems: 0, items: [] } } } };
    }
    const input = (variables.options ?? {}) as Record<string, unknown>;
    const orders = await this.ordersService.findMyOrders(userId, {
      page: (input.skip as number ?? 0) / (input.take as number ?? 20) + 1,
      limit: input.take as number ?? 20,
      status: ((input.filter as Record<string, unknown> | undefined)?.status as string | undefined),
    });
    return {
      data: {
        activeCustomer: {
          id: userId,
          orders: {
            totalItems: orders.total,
            items: orders.items.map((o: any) => this.mapOrderListItem(o)),
          },
        },
      },
    };
  }

  private async handleGetOrderDetail(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const code = variables.code as string;
    const userId = await this.resolveUserId(options.token) ?? undefined;
    try {
      const order = await this.ordersService.findOrderByCode(code, userId);
      return { data: { orderByCode: this.mapOrderToGraphQL(order) } };
    } catch (e: any) {
      this.logger.warn(`getOrderDetail failed: ${e.message}`);
      return { data: { orderByCode: null } };
    }
  }

  private async handleGetOrderByCode(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const code = variables.code as string;
    const userId = await this.resolveUserId(options.token) ?? undefined;
    try {
      const order = await this.ordersService.findOrderByCode(code, userId);
      return { data: { orderByCode: this.mapOrderToGraphQL(order) } };
    } catch (e: any) {
      this.logger.warn(`getOrderByCode failed: ${e.message}`);
      return { data: { orderByCode: null } };
    }
  }

  // ─── Checkout/Order Helpers ───

  private mapAddressInput(input: Record<string, unknown>): any {
    return {
      line1: (input.streetLine1 ?? '') as string,
      line2: (input.streetLine2 ?? '') as string,
      city: (input.city ?? '') as string,
      state: (input.province ?? '') as string,
      postalCode: (input.postalCode ?? '') as string,
      countryCode: (input.countryCode ?? 'VN') as string,
      phone: (input.phoneNumber ?? '') as string,
    };
  }

  private mapAddressToGraphQL(input: Record<string, unknown>): Record<string, unknown> {
    return {
      fullName: (input.fullName ?? '') as string,
      company: (input.company ?? '') as string,
      streetLine1: (input.streetLine1 ?? '') as string,
      streetLine2: (input.streetLine2 ?? '') as string,
      city: (input.city ?? '') as string,
      province: (input.province ?? '') as string,
      postalCode: (input.postalCode ?? '') as string,
      country: {
        id: (input.countryCode ?? 'VN') as string,
        code: (input.countryCode ?? 'VN') as string,
        name: (input.countryCode ?? 'VN') as string,
      },
      phoneNumber: (input.phoneNumber ?? '') as string,
    };
  }

  private mapOrderListItem(order: any): Record<string, unknown> {
    const items = (order.items ?? []).slice(0, 3).map((item: any) => ({
      id: item.id,
      productVariant: {
        id: item.variantId,
        name: typeof item.variantName === 'object'
          ? (item.variantName?.en ?? item.variantName?.vi ?? '')
          : (item.variantName ?? ''),
        product: {
          id: item.productId ?? item.variantId,
          name: typeof item.productName === 'object'
            ? (item.productName?.en ?? item.productName?.vi ?? '')
            : (item.productName ?? ''),
          featuredAsset: {} as any,
        },
      },
    }));

    return {
      id: order.id,
      code: order.code,
      state: order.status,
      totalWithTax: order.grandTotal ?? 0,
      currencyCode: order.currencyCode ?? 'VND',
      createdAt: order.createdAt?.toISOString() ?? '',
      updatedAt: order.updatedAt?.toISOString() ?? '',
      lines: items,
    };
  }

  private mapOrderToGraphQL(order: any): Record<string, unknown> {
    const lines = (order.items ?? []).map((item: any) => {
      const productName = typeof item.productName === 'object'
        ? (item.productName?.en ?? item.productName?.vi ?? '')
        : (item.productName ?? '');
      const variantName = typeof item.variantName === 'object'
        ? (item.variantName?.en ?? item.variantName?.vi ?? '')
        : (item.variantName ?? '');

      return {
        id: item.id,
        productVariant: {
          id: item.variantId,
          name: variantName,
          sku: item.sku ?? '',
          product: {
            id: item.productId ?? item.variantId,
            name: productName,
            slug: '',
            featuredAsset: null,
          },
        },
        quantity: item.quantity ?? 0,
        unitPriceWithTax: item.unitPrice ?? 0,
        linePriceWithTax: item.linePrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 0),
      };
    });

    const shippingAddr = (order.addresses ?? []).find((a: any) => a.type === 'shipping');
    const billingAddr = (order.addresses ?? []).find((a: any) => a.type === 'billing');

    return {
      __typename: 'Order',
      id: order.id,
      code: order.code,
      state: order.status ?? 'pending',
      active: false,
      createdAt: order.createdAt?.toISOString() ?? '',
      updatedAt: order.updatedAt?.toISOString() ?? '',
      totalQuantity: lines.reduce((s: number, l: any) => s + l.quantity, 0),
      subTotal: order.subtotal ?? 0,
      subTotalWithTax: order.subtotal ?? 0,
      shipping: order.shippingTotal ?? 0,
      shippingWithTax: order.shippingTotal ?? 0,
      total: order.grandTotal ?? 0,
      totalWithTax: order.grandTotal ?? 0,
      currencyCode: order.currencyCode ?? 'VND',
      customer: order.userId ? {
        id: order.userId,
        firstName: '',
        lastName: '',
        emailAddress: order.email ?? '',
        phoneNumber: '',
      } : undefined,
      shippingAddress: shippingAddr ? {
        fullName: shippingAddr.fullName ?? '',
        company: shippingAddr.company ?? '',
        streetLine1: shippingAddr.streetLine1 ?? '',
        streetLine2: shippingAddr.streetLine2 ?? '',
        city: shippingAddr.city ?? '',
        province: shippingAddr.province ?? '',
        postalCode: shippingAddr.postalCode ?? '',
        country: shippingAddr.countryCode ? {
          id: shippingAddr.countryCode,
          code: shippingAddr.countryCode,
          name: shippingAddr.countryCode,
        } : null,
        phoneNumber: shippingAddr.phone ?? '',
      } : undefined,
      billingAddress: billingAddr ? {
        fullName: billingAddr.fullName ?? '',
        company: billingAddr.company ?? '',
        streetLine1: billingAddr.streetLine1 ?? '',
        streetLine2: billingAddr.streetLine2 ?? '',
        city: billingAddr.city ?? '',
        province: billingAddr.province ?? '',
        postalCode: billingAddr.postalCode ?? '',
        country: billingAddr.countryCode ? {
          id: billingAddr.countryCode,
          code: billingAddr.countryCode,
          name: billingAddr.countryCode,
        } : null,
        phoneNumber: billingAddr.phone ?? '',
      } : undefined,
      shippingLines: [{
        shippingMethod: {
          id: order.shippingMethod ?? 'standard',
          name: order.shippingMethod ?? 'Standard Shipping',
          description: '',
        },
        priceWithTax: order.shippingTotal ?? 0,
      }],
      payments: (order.payments ?? []).map((p: any) => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        state: p.state ?? 'settled',
        transactionId: p.transactionId ?? '',
        createdAt: p.createdAt?.toISOString() ?? '',
      })),
      lines,
      discounts: (order.discounts ?? []).map((d: any) => ({
        description: d.description ?? d.couponCode ?? '',
        amountWithTax: d.amount ?? 0,
      })),
      couponCodes: (order.discounts ?? []).map((d: any) => d.couponCode).filter(Boolean),
    };
  }

  private normalizeSort(sort: unknown): string | undefined {
    if (!sort) return undefined;
    if (typeof sort === 'string') return sort;
    if (typeof sort === 'object') {
      const sortFieldMap: Record<string, string> = { name: 'name', price: 'basePrice' };
      const entry = Object.entries(sort as Record<string, string>)[0];
      if (entry) {
        const [field, dir] = entry;
        const dbField = sortFieldMap[field] || 'created_at';
        return `${dbField}:${dir}`;
      }
    }
    return undefined;
  }

  // ─── Article Helpers ───

  private mapArticleCard(article: any, locale: string): Record<string, unknown> {
    const category = article.categories?.[0];
    return {
      id: article.id,
      title: article.title?.[locale] ?? article.title?.en ?? '',
      slug: article.slug,
      excerpt: article.excerpt?.[locale] ?? article.excerpt?.en ?? '',
      author: article.author ?? '',
      publishedAt: article.publishedAt?.toISOString() ?? article.published_at?.toISOString() ?? '',
      viewCount: 0,
      featuredAsset: article.imageUrl ? {
        id: article.id,
        preview: article.imageUrl,
        source: article.imageUrl,
        width: 0,
        height: 0,
        name: '',
      } : null,
      category: category ? {
        id: category.id,
        name: category.name?.[locale] ?? category.name?.en ?? '',
        slug: category.slug,
      } : null,
      tags: (article.tags ?? []).map((t: any) => ({
        id: t.id,
        name: t.name?.[locale] ?? t.name?.en ?? '',
        slug: t.slug,
      })),
    };
  }

  private mapArticleDetail(article: any, locale: string): Record<string, unknown> {
    const card = this.mapArticleCard(article, locale);
    return {
      ...card,
      content: article.content?.[locale] ?? article.content?.en ?? '',
      createdAt: article.createdAt?.toISOString() ?? '',
      updatedAt: article.updatedAt?.toISOString() ?? '',
      seoTitle: article.title?.[locale] ?? article.title?.en ?? '',
      seoDescription: article.excerpt?.[locale] ?? article.excerpt?.en ?? '',
      seoKeywords: '',
      assets: article.imageUrl ? [{
        id: article.id,
        preview: article.imageUrl,
        source: article.imageUrl,
        width: 0,
        height: 0,
        name: '',
      }] : [],
    };
  }

  // ─── Address Handlers ───

  private async handleGetCustomerAddresses(
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { activeCustomer: { id: '', addresses: [] } } };
    }
    try {
      const addresses = await this.addressRepo.find({
        where: { userId, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });
      return {
        data: {
          activeCustomer: {
            id: userId,
            addresses: addresses.map((a) => ({
              id: a.id,
              fullName: a.fullName,
              company: a.company,
              streetLine1: a.streetLine1,
              streetLine2: a.streetLine2,
              city: a.city,
              province: a.province,
              postalCode: a.postalCode,
              country: {
                id: a.countryCode,
                code: a.countryCode,
                name: a.countryCode,
              },
              phoneNumber: a.phone,
              defaultShippingAddress: a.isDefaultShipping,
              defaultBillingAddress: a.isDefaultBilling,
            })),
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`getCustomerAddresses failed: ${e.message}`);
      return { data: { activeCustomer: { id: userId ?? '', addresses: [] } } };
    }
  }

  private async handleCreateCustomerAddress(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { createCustomerAddress: null } };
    }
    const input = (variables.input ?? {}) as Record<string, unknown>;
    try {
      const addr = this.addressRepo.create({
        userId,
        fullName: (input.fullName ?? '') as string,
        company: (input.company ?? '') as string,
        streetLine1: (input.streetLine1 ?? '') as string,
        streetLine2: (input.streetLine2 ?? '') as string,
        city: (input.city ?? '') as string,
        province: (input.province ?? '') as string,
        postalCode: (input.postalCode ?? '') as string,
        countryCode: (input.countryCode ?? 'VN') as string,
        phone: (input.phoneNumber ?? '') as string,
        isDefaultShipping: (input.defaultShippingAddress as boolean) ?? false,
        isDefaultBilling: (input.defaultBillingAddress as boolean) ?? false,
      });
      const saved = await this.addressRepo.save(addr);
      return {
        data: {
          createCustomerAddress: {
            id: saved.id,
            fullName: saved.fullName,
            company: saved.company,
            streetLine1: saved.streetLine1,
            streetLine2: saved.streetLine2,
            city: saved.city,
            province: saved.province,
            postalCode: saved.postalCode,
            country: {
              id: saved.countryCode,
              code: saved.countryCode,
              name: saved.countryCode,
            },
            phoneNumber: saved.phone,
            defaultShippingAddress: saved.isDefaultShipping,
            defaultBillingAddress: saved.isDefaultBilling,
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`createCustomerAddress failed: ${e.message}`);
      return { data: { createCustomerAddress: null } };
    }
  }

  private async handleUpdateCustomerAddress(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { updateCustomerAddress: null } };
    }
    const input = (variables.input ?? {}) as Record<string, unknown>;
    const id = variables.id as string;
    try {
      const existing = await this.addressRepo.findOne({
        where: { id, userId, deletedAt: IsNull() },
      });
      if (!existing) {
        return { data: { updateCustomerAddress: null } };
      }
      if (input.streetLine1) existing.streetLine1 = input.streetLine1 as string;
      if (input.streetLine2 !== undefined) existing.streetLine2 = input.streetLine2 as string;
      if (input.city) existing.city = input.city as string;
      if (input.province) existing.province = input.province as string;
      if (input.postalCode !== undefined) existing.postalCode = input.postalCode as string;
      if (input.countryCode) existing.countryCode = input.countryCode as string;
      if (input.phoneNumber !== undefined) existing.phone = input.phoneNumber as string;
      if (input.fullName) existing.fullName = input.fullName as string;
      if (input.company !== undefined) existing.company = input.company as string;
      if (input.defaultShippingAddress !== undefined) existing.isDefaultShipping = input.defaultShippingAddress as boolean;
      if (input.defaultBillingAddress !== undefined) existing.isDefaultBilling = input.defaultBillingAddress as boolean;
      const saved = await this.addressRepo.save(existing);
      return {
        data: {
          updateCustomerAddress: {
            id: saved.id,
            fullName: saved.fullName,
            company: saved.company,
            streetLine1: saved.streetLine1,
            streetLine2: saved.streetLine2,
            city: saved.city,
            province: saved.province,
            postalCode: saved.postalCode,
            country: {
              id: saved.countryCode,
              code: saved.countryCode,
              name: saved.countryCode,
            },
            phoneNumber: saved.phone,
            defaultShippingAddress: saved.isDefaultShipping,
            defaultBillingAddress: saved.isDefaultBilling,
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`updateCustomerAddress failed: ${e.message}`);
      return { data: { updateCustomerAddress: null } };
    }
  }

  private async handleDeleteCustomerAddress(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const userId = await this.resolveUserId(options.token);
    if (!userId) {
      return { data: { deleteCustomerAddress: { success: false } } };
    }
    const id = variables.id as string;
    try {
      await this.addressRepo.softDelete({ id, userId });
      return { data: { deleteCustomerAddress: { success: true } } };
    } catch (e: any) {
      this.logger.warn(`deleteCustomerAddress failed: ${e.message}`);
      return { data: { deleteCustomerAddress: { success: false } } };
    }
  }

  // ─── Article Handlers ───

  private async handleGetArticles(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const locale = options.languageCode ?? 'en';
    try {
      const result = await this.articlesService.findAll({
        skip: variables.skip as number | undefined,
        take: variables.take as number | undefined,
        search: variables.search as string | undefined,
        category: variables.category as string | undefined,
        tag: variables.tag as string | undefined,
      });
      return {
        data: {
          articles: {
            items: result.items.map((a) => this.mapArticleCard(a, locale)),
            totalItems: result.total,
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`getArticles failed: ${e.message}`);
      return { data: { articles: { items: [], totalItems: 0 } } };
    }
  }

  private async handleGetArticleBySlug(
    variables: Record<string, unknown>,
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    const slug = variables.slug as string;
    const locale = options.languageCode ?? 'en';
    try {
      const article = await this.articlesService.findBySlug(slug);
      if (!article) {
        return { data: { article: null } };
      }
      return {
        data: {
          article: this.mapArticleDetail(article, locale),
        },
      };
    } catch (e: any) {
      this.logger.warn(`getArticleBySlug failed: ${e.message}`);
      return { data: { article: null } };
    }
  }

  private async handleGetArticleCategories(
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    try {
      const result = await this.articlesService.findCategories();
      return {
        data: {
          articleCategories: {
            items: result.items.map((c) => ({
              id: c.id,
              name: c.name?.en ?? '',
              slug: c.slug,
            })),
            totalItems: result.total,
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`getArticleCategories failed: ${e.message}`);
      return { data: { articleCategories: { items: [], totalItems: 0 } } };
    }
  }

  private async handleGetArticleTags(
    _options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    try {
      const result = await this.articlesService.findTags();
      return {
        data: {
          articleTags: {
            items: result.items.map((t) => ({
              id: t.id,
              name: t.name?.en ?? '',
              slug: t.slug,
            })),
            totalItems: result.total,
          },
        },
      };
    } catch (e: any) {
      this.logger.warn(`getArticleTags failed: ${e.message}`);
      return { data: { articleTags: { items: [], totalItems: 0 } } };
    }
  }

  // ─── Reference Handlers ───

  private async handleGetAvailableCountries(
    options: ExecuteOptions,
  ): Promise<ExecuteResult> {
    try {
      const countries = await this.countryRepo.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC' },
      });
      const locale = options.languageCode ?? 'en';
      return {
        data: {
          availableCountries: countries.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name?.[locale] ?? c.name?.en ?? c.code,
          })),
        },
      };
    } catch (e: any) {
      this.logger.warn(`getAvailableCountries failed: ${e.message}`);
      return { data: { availableCountries: [] } };
    }
  }
}
