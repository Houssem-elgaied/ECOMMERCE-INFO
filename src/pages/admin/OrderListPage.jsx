//import React, { useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {  FaXmark } from 'react-icons/fa6';
import { FaCheck } from 'react-icons/fa';
import { useGetOrdersQuery, useDeleteOrderMutation } from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import { useSelector } from 'react-redux';
import { addCurrency } from '../../utils/addCurrency';

const OrderListsPage = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [deleteOrder, { isLoading: deleteLoading, error: deleteError }] = useDeleteOrderMutation();
  const { userInfo } = useSelector(state => state.auth);

  const handleRemoveOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to remove this order?')) {
      try {
        await deleteOrder(orderId).unwrap(); // Utilisation de unwrap() pour attraper les erreurs
        alert('Order removed successfully');
      } catch (error) {
        console.error(error); // Loggez l'erreur pour le débogage
        alert('Failed to remove order');
      }
    }
  };

  return (
    <>
      <Meta title={'Order List'} />
      <h2>Orders</h2>

      {/* Affichage de la gestion des erreurs de suppression */}
      {deleteError && (
        <Message variant="danger">
          {deleteError?.data?.message || deleteError.message || 'Failed to remove order'}
        </Message>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped hover bordered responsive size='sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order._id}>
                <td>{order.user._id}</td>
                <td>{order.user.name}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{addCurrency(order.totalPrice)}</td>
                <td>
                  {order.isPaid ? (
                    <FaCheck style={{ color: 'green' }} />
                  ) : (
                    <FaXmark style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <FaCheck style={{ color: 'green' }} />
                  ) : (
                    <span>Pending</span> // Afficher "Pending" pour les commandes non livrées
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    <span>Delivered on {new Date(order.deliveredAt).toLocaleString()}</span>
                  ) : (
                    <span>Waiting for delivery</span> // Afficher "Waiting for delivery" si non livré
                  )}
                </td>
                <td>
                  <LinkContainer
                    to={
                      userInfo.isAdmin
                        ? `/admin/order/${order._id}`
                        : `/order/${order._id}`
                    }
                  >
                    <Button className='btn-sm' variant='info'>
                      Details
                    </Button>
                  </LinkContainer>
                  {userInfo.isAdmin && (
                    <Button
                      className='btn-sm'
                      variant='danger'
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleRemoveOrder(order._id)}
                      disabled={deleteLoading} // Désactivez le bouton pendant que la mutation est en cours
                    >
                      {deleteLoading ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListsPage;
