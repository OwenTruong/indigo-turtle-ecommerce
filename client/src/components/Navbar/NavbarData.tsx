/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CartProduct,
  NavItems,
  NavItemsProps,
  NavProps,
  Product,
} from '../../global';
import { useSelector } from 'react-redux';
import { selectCart, selectUser } from '../../store';
import { IconType } from 'react-icons';
import axios from 'axios';
import { CORS_CONFIG, SERVER_URL } from '../../config';
import { spawn } from 'child_process';

const TEMP_CHECKOUT_PRODUCT_LIST = [
  {
    name: 'LIDYUK End Table with Charging Station, Flip Top Side Table',
    userId: 2,
    quantity: 5,
  },
  {
    name: 'testproduct1',
    userId: 1,
    quantity: 1,
  },
  {
    name: 'testproduct2',
    userId: 1,
    quantity: 4,
  },
  {
    name: 'myproduct',
    userId: 2,
    quantity: 2,
  },
];

interface CheckoutProductData {
  name: string;
  userId: number;
  quantity: number;
}

export const Logo = (props: NavItemsProps) => {
  return (
    <div className="w-16">
      <NavLink to={props.path}>{props.image}</NavLink>
    </div>
  );
};

export const SiteName = (props: NavItemsProps) => {
  return (
    <div className="SiteName">
      <NavLink to={props.path}>{props.name}</NavLink>
    </div>
  );
};

const CartLink = ({
  cartProps,
  className,
}: {
  cartProps: NavProps;
  className: string;
}): JSX.Element => {
  const cart = useSelector(selectCart);
  const user = useSelector(selectUser);
  if (user.username === '') {
    console.error('User not defined while initializing CartLink component.');
    return <></>;
  }
  const prods: CheckoutProductData[] = cart.map((prod) => ({
    name: prod.name,
    userId: 0,
    quantity: prod.quantity,
  }));

  const getCheckout = async (
    prods: CartProduct[]
  ): Promise<string | undefined> =>
    (
      await axios.post(
        `${SERVER_URL}/checkout`,
        { products: prods },
        CORS_CONFIG
      )
    )?.data.url;

  const cartClicked = (): void => {
    (async (): Promise<void> => {
      const prods = cart as unknown as CartProduct[]; // FIXME: Remove this type conversion once shankssc merges his Redux Store changes
      // const prods: CartProduct[] = TEMP_CHECKOUT_PRODUCT_LIST;

      if (prods.length === 0) {
        alert('No item in cart.');
        return;
      }
      const url: string | undefined = await getCheckout(prods);
      if (url === undefined) return;
      window.location.href = url;
    })().catch((err) => {
      console.error(err);
    });
  };

  return (
    <button
      onClick={() => {
        cartClicked();
      }}
      className={className}
    >
      <span>{cartProps.icon}</span>
      <span>{cartProps.name}</span>
      <span>{cart.length}</span>
    </button>
  );
};

export const NavList = (props: NavItems) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const NAVLINK_CLASS =
    'inline-flex items-center gap-2 duration-150 hover:text-secondary-light';
  const USERNAME_CLASS = 'inline-flex items-center duration-150 text-xl';
  const LOGIN_CLASS =
    'inline-flex items-center gap-2 duration-150 hover:text-secondary-light';

  return (
    <div className="NavLinks">
      {props.items.map((item) =>
        item.name === 'Cart' ? (
          <CartLink
            cartProps={item}
            className={NAVLINK_CLASS}
            key={item.path}
          />
        ) : (
          <NavLink to={item.path} className={NAVLINK_CLASS} key={item.path}>
            {item.icon}
            {item.name}
          </NavLink>
        )
      )}
      {user.username === '' ? (
        <span
          className={LOGIN_CLASS}
          onClick={() => {
            navigate('/AuthPage');
          }}
        >
          Login
        </span>
      ) : (
        <span className={USERNAME_CLASS}>{user.username}</span>
      )}
    </div>
  );
};
