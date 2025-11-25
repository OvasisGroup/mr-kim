'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface SubCategory {
  id: string;
  subCategoryName: string;
  subCategoryIcon: string | null;
  description: string | null;
  image: string | null;
}

interface Category {
  id: string;
  categoryName: string;
  categoryIcon: string | null;
  description: string | null;
  image: string | null;
  subCategories: SubCategory[];
}

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesCategory = category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubCategory = category.subCategories.some(sub =>
      sub.subCategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory || matchesSubCategory;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
          <p className="text-gray-600 mt-2">Explore our categories and services</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search categories or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-600">No categories or services found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {category.image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={category.image}
                          alt={category.categoryName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : category.categoryIcon ? (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-2xl">
                        {category.categoryIcon}
                      </div>
                    ) : null}
                    <div className="flex-1">
                      <CardTitle>{category.categoryName}</CardTitle>
                      {category.description && (
                        <CardDescription className="mt-2">{category.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.subCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.subCategories.map((subCategory) => (
                        <Card
                          key={subCategory.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => router.push(`/dashboard/customer/services/${category.id}/${subCategory.id}`)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              {subCategory.image ? (
                                <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                                  <Image
                                    src={subCategory.image}
                                    alt={subCategory.subCategoryName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : subCategory.subCategoryIcon ? (
                                <div className="w-12 h-12 rounded-md bg-primary/5 flex items-center justify-center shrink-0 text-xl">
                                  {subCategory.subCategoryIcon}
                                </div>
                              ) : null}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-1">{subCategory.subCategoryName}</h3>
                                {subCategory.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2">{subCategory.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No services available in this category yet.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
