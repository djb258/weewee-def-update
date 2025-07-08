# UI Library Guide

## Overview

This guide covers the comprehensive UI library installed for better-looking outputs, webpages, and dashboards. The library includes modern React components, charts, animations, and styling utilities.

## 🎨 Installed Libraries

### Core UI Libraries
- **@headlessui/react** - Unstyled, accessible UI components
- **@heroicons/react** - Beautiful SVG icons
- **lucide-react** - Additional icon set
- **framer-motion** - Smooth animations and transitions
- **react-hot-toast** - Toast notifications
- **clsx** & **tailwind-merge** - Utility-first CSS class management

### Data Visualization
- **recharts** - React charting library
- **@tremor/react** - Advanced dashboard components

### Forms & Tables
- **react-hook-form** - Performant forms with validation
- **@hookform/resolvers** - Form validation resolvers
- **@tanstack/react-table** - Powerful data tables
- **react-select** - Advanced select components
- **react-datepicker** - Date and time pickers

## 🚀 Quick Start

### Basic Component Usage

```tsx
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Dashboard } from '../components/dashboard/Dashboard';

function App() {
  return (
    <div className="p-6">
      <Dashboard />
      
      <Card className="mt-6">
        <CardHeader>
          <h2>Sample Card</h2>
        </CardHeader>
        <CardContent>
          <Button variant="primary" size="lg">
            Click Me
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 📊 Dashboard Components

### Basic Dashboard

```tsx
import { Dashboard } from '../components/dashboard/Dashboard';

function MyDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Dashboard />
    </div>
  );
}
```

### Custom Dashboard with Charts

```tsx
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 }
];

function CustomDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <h3>Monthly Sales</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🎯 UI Components

### Button Component

```tsx
import { Button } from '../components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons
<Button icon={<PlusIcon className="h-4 w-4" />}>
  Add Item
</Button>

// Loading state
<Button loading>Processing...</Button>
```

### Card Component

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// With different padding and shadow
<Card padding="lg" shadow="lg">
  <CardContent>
    <p>Large padding and shadow</p>
  </CardContent>
</Card>
```

## 📈 Charts & Data Visualization

### Bar Chart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 }
];

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#3B82F6" />
  </BarChart>
</ResponsiveContainer>
```

### Line Chart

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

### Pie Chart

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

## 🎭 Animations with Framer Motion

### Basic Animation

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <Card>
    <CardContent>
      <p>Animated content</p>
    </CardContent>
  </Card>
</motion.div>
```

### Hover Animation

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Button>Hover me</Button>
</motion.div>
```

### Staggered Animations

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item, index) => (
    <motion.div key={index} variants={item}>
      <Card>{item.content}</Card>
    </motion.div>
  ))}
</motion.div>
```

## 🔔 Notifications with React Hot Toast

```tsx
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const showNotification = () => {
    toast.success('Success notification!');
    toast.error('Error notification!');
    toast.loading('Loading...');
  };

  return (
    <div>
      <Button onClick={showNotification}>Show Toast</Button>
      <Toaster position="top-right" />
    </div>
  );
}
```

## 📋 Forms with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';

interface FormData {
  name: string;
  email: string;
}

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## 📊 Tables with TanStack Table

```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
];

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' }
];

function DataTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <h3>Users</h3>
      </CardHeader>
      <CardContent>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Utility Classes

### Class Management with clsx and tailwind-merge

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine classes safely
const className = twMerge(
  clsx(
    'base-class',
    condition && 'conditional-class',
    'another-class'
  )
);

// Example usage
<Button className={twMerge(
  clsx(
    'bg-blue-600',
    isActive && 'bg-blue-700',
    'hover:bg-blue-800'
  )
)}>
  Button
</Button>
```

## 🎯 Best Practices

### Component Organization
- Keep components in `src/components/ui/` for reusable UI components
- Use `src/components/dashboard/` for dashboard-specific components
- Follow consistent naming conventions

### Styling
- Use Tailwind CSS classes for styling
- Leverage `clsx` and `tailwind-merge` for conditional classes
- Maintain consistent spacing and color schemes

### Performance
- Use `React.memo` for expensive components
- Implement proper loading states
- Optimize chart rendering with `ResponsiveContainer`

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios

## 🔧 Customization

### Theme Configuration

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### Custom Components

```tsx
// src/components/ui/CustomButton.tsx
import { Button } from './Button';

export const CustomButton = ({ children, ...props }) => (
  <Button 
    className="bg-gradient-to-r from-blue-500 to-purple-600"
    {...props}
  >
    {children}
  </Button>
);
```

## 📚 Related Documentation

- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Chart library documentation
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Hook Form](https://react-hook-form.com/) - Form library
- [TanStack Table](https://tanstack.com/table) - Table library

---

**Built for modern, beautiful, and accessible user interfaces.** 