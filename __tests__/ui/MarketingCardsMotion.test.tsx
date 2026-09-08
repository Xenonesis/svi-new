import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProjectCard from '@/src/components/home/ProjectCard';
import BlogCard from '@/src/components/home/BlogCard';

describe('Marketing Cards Motion & Hover Styling', () => {
  it('renders ProjectCard with hover-lift and group classes', () => {
    const { container } = render(
      <ProjectCard
        title="Royal Heritage Estate"
        location="Lucknow"
        type="Villas"
        img="/images/projects/project1.jpg"
        completedLabel="Ready to Move"
        exploreLabel="Explore Project"
      />
    );

    const card = container.querySelector('.hover-lift');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('hover-gold-glow');
    expect(screen.getByText('Explore Project')).toBeDefined();

    // Check optical zoom on project image
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image?.className).toContain('group-hover:scale-105');
    expect(image?.className).toContain('transition-transform');

    // Check arrow nudge on explore link icon
    const arrow = container.querySelector('.group-hover-nudge-x');
    expect(arrow).not.toBeNull();
  });

  it('renders BlogCard with hover-lift styling', () => {
    const { container } = render(
      <BlogCard
        slug="real-estate-trends-2026"
        title="Top Real Estate Trends in 2026"
        excerpt="An in-depth analysis of emerging luxury infra corridors."
        category="Market Insights"
        date="08 Sep 2026"
        readTime="4 min read"
        coverImage="/images/blog/trend.jpg"
      />
    );

    const card = container.querySelector('.hover-lift');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('hover-gold-glow');

    // Check optical zoom on blog image
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image?.className).toContain('group-hover:scale-105');
    expect(image?.className).toContain('transition-transform');
  });

  it('renders BlogCard with nested post prop structure from HomeBlogs', () => {
    const mockPost = {
      slug: 'sustainable-architecture-2026',
      title: 'Sustainable Architecture in India',
      excerpt: 'Green building norms and net-zero homes.',
      category: 'Sustainability',
      date: '05 Sep 2026',
      readTime: '5 min read',
      image: '/images/blog/green.jpg',
      author: 'Vikram Seth',
    };

    const { container } = render(
      <BlogCard
        post={mockPost}
        locale="en"
        isHindi={false}
        gradient="from-green-500 to-emerald-600"
      />
    );

    const card = container.querySelector('.hover-lift');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('hover-gold-glow');
    expect(screen.getByText('Sustainable Architecture in India')).toBeDefined();
    expect(screen.getByText('Vikram Seth')).toBeDefined();
  });
});
