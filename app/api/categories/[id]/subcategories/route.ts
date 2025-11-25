import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { subCategoryName, subCategoryIcon, description, image } = body;

    if (!subCategoryName) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        subCategoryName,
        subCategoryIcon,
        description,
        image,
        categoryId: id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}
