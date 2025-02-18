'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAPI() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const apiDocs = {
    accounts: {
      title: 'Accounts API',
      endpoints: [
        {
          method: 'GET',
          path: '/api/accounts',
          description: 'Fetch all accounts for the current user',
        },
        {
          method: 'POST',
          path: '/api/accounts',
          description: 'Create a new account',
          body: {
            name: 'Test Account',
            type: 'checking',
            balance: 1000,
          },
        },
        {
          method: 'PUT',
          path: '/api/accounts/67b335ba70d41ea53fdf93fb',
          description: 'Update an existing account',
          body: {
            name: 'Updated Account',
            balance: 2000,
          },
        },
        {
          method: 'DELETE',
          path: '/api/accounts/67b3340970d41ea53fdf93ea',
          description: 'Delete an account',
        },
      ],
    },
    categories: {
      title: 'Categories API',
      endpoints: [
        {
          method: 'GET',
          path: '/api/categories',
          description: 'Fetch all categories',
        },
        {
          method: 'POST',
          path: '/api/categories',
          description: 'Create a new category',
          body: {
            name: 'Category name',
          },
        },
        {
          method: 'PUT',
          path: '/api/categories/67b3336670d41ea53fdf93d5',
          description: 'Update a category',
          body: {
            name: 'Updated Category',
          },
        },
        {
          method: 'DELETE',
          path: '/api/categories/67b3336670d41ea53fdf93d5',
          description: 'Delete a category',
        },
      ],
    },
    transactions: {
      title: 'Transactions API',
      endpoints: [
        {
          method: 'GET',
          path: '/api/transactions',
          description: 'Fetch all transactions for the current user',
        },
        {
          method: 'POST',
          path: '/api/transactions',
          description: 'Create a new transaction',
          body: {
            amount: 2000,
            description: 'Transaction description',
            category_id: '67b40be2dde066618fd7f5ef',
            account: '67b40bb7dde066618fd7f5eb',
            date: '2024-01-01',
            transaction_type: 'income',
          },
        },
        {
          method: 'PUT',
          path: '/api/transactions/67b337b170d41ea53fdf9415',
          description: 'Update a transaction',
          body: {
            amount: 3000,
            description: 'Updated transaction description',
            category_id: '67b3348770d41ea53fdf93ef',
            account: '67b335ba70d41ea53fdf93fb',
            date: '2024-01-01',
            transaction_type: 'expense',
          },
        },
        {
          method: 'DELETE',
          path: '/api/transactions/67b3336770d41ea53fdf93d9',
          description: 'Delete a transaction',
        },
      ],
    },
    budgets: {
      title: 'Budgets API',
      endpoints: [
        {
          method: 'GET',
          path: '/api/budgets',
          description: 'Fetch all budgets for the current user',
        },
        {
          method: 'POST',
          path: '/api/budgets',
          description: 'Create a new budget',
          body: {
            category_id: '67b3348770d41ea53fdf93ef',
            monthly_budget: '3000',
            month: '1',
            year: '2024',
          },
        },
        {
          method: 'PUT',
          path: '/api/budgets/67b3388170d41ea53fdf9428',
          description: 'Update a budget',
          body: {
            monthly_budget: '4000',
          },
        },
        {
          method: 'DELETE',
          path: '/api/budgets/67b338bc70d41ea53fdf942e',
          description: 'Delete a budget',
        },
      ],
    },
  };

  const testEndpoint = async (method, path, body = null, endpointKey) => {
    try {
      setLoading((prev) => ({ ...prev, [endpointKey]: true }));

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(path, options);
      const data = await res.json();

      setTestResults((prev) => ({
        ...prev,
        [endpointKey]: data,
      }));

      return data;
    } catch (err) {
      setError(`Failed to test endpoint: ${path}`);
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, [endpointKey]: false }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {Object.entries(apiDocs).map(([key, api]) => (
        <div key={key} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{api.title}</h2>

          <div className="space-y-4">
            {api.endpoints.map((endpoint, index) => {
              const endpointKey = `${key}_${endpoint.method}_${index}`;

              return (
                <div key={endpointKey} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-sm text-white
                          ${
                            endpoint.method === 'GET'
                              ? 'bg-blue-500'
                              : endpoint.method === 'POST'
                              ? 'bg-green-500'
                              : endpoint.method === 'PUT'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button
                      onClick={() =>
                        testEndpoint(
                          endpoint.method,
                          endpoint.path,
                          endpoint.body,
                          endpointKey,
                        )
                      }
                      disabled={loading[endpointKey]}
                      size="sm"
                    >
                      {loading[endpointKey] ? 'Testing...' : 'Test Endpoint'}
                    </Button>
                  </div>

                  <p className="text-gray-600 mb-2">{endpoint.description}</p>

                  {endpoint.body && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold mb-1">
                        Request Body:
                      </h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm">
                        {JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResults[endpointKey] && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-1">
                        Test Result:
                      </h4>
                      <pre className="bg-gray-100 p-2 rounded text-sm max-h-60 overflow-auto">
                        {JSON.stringify(testResults[endpointKey], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
