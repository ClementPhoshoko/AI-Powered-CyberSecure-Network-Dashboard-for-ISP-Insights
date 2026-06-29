import api from './api';

export const getSubscriber = async () => {
  const response = await api.get('/subscriber');
  return response.data;
};

export const subscribe = async (subscriberData) => {
  const response = await api.post('/subscriber', subscriberData);
  return response.data;
};

export const updateSubscription = async (subscriberData) => {
  const response = await api.put('/subscriber', subscriberData);
  return response.data;
};

export const unsubscribe = async () => {
  const response = await api.delete('/subscriber');
  return response.data;
};
