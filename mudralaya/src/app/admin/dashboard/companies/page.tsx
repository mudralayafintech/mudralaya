import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCompaniesPage() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching companies:", error);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Partner Companies</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Add Company
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500">
            <tr>
              <th className="p-4 font-medium">Company Name</th>
              <th className="p-4 font-medium">Overview</th>
              <th className="p-4 font-medium">Created At</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(companies && companies.length > 0) ? companies.map((company: any) => (
              <tr key={company.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{company.name}</td>
                <td className="p-4 truncate max-w-xs">{company.overview || '-'}</td>
                <td className="p-4">{new Date(company.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-3 text-blue-600">
                    <button className="hover:underline">Edit</button>
                    <button className="hover:underline">Modules</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No companies found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
