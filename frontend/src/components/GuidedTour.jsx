import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const GuidedTour = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const userName = user?.firstName || 'there';

  // Check if tour should run (one time only per user)
  useEffect(() => {
    if (!user?.id) return;
    
    const tourKey = `trinity_tour_completed_${user.id}`;
    const tourCompleted = localStorage.getItem(tourKey);
    
    // Only run on dashboard and if never completed
    if (!tourCompleted && location.pathname === '/') {
      setTimeout(() => setRun(true), 500);
    }
  }, [user?.id, location.pathname]);

  const handleJoyrideCallback = (data) => {
    const { status, action, index, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Save with user ID so it's one-time per user
      const tourKey = `trinity_tour_completed_${user?.id}`;
      localStorage.setItem(tourKey, 'true');
      setRun(false);
    }
  };

  const resetTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  useEffect(() => {
    window.resetGuidedTour = resetTour;
    return () => {
      delete window.resetGuidedTour;
    };
  }, []);

  // Customer tour steps
  const customerSteps = [
    {
      target: 'body',
      placement: 'center',
      title: `Welcome, ${userName}!`,
      content: 'Let me give you a quick tour of Trinity Grocery. This will only take a moment!',
      disableBeacon: true,
    },
    {
      target: '[data-tour="shop-now"]',
      title: 'Start Shopping',
      content: 'Click here to browse our wide selection of groceries and add items to your cart.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="my-orders"]',
      title: 'Track Your Orders',
      content: 'View your order history, download receipts, and track delivery status here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="nav-shop"]',
      title: 'Shop Anytime',
      content: 'You can always access the shop from the navigation menu.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-cart"]',
      title: 'Your Cart',
      content: 'See your cart items and proceed to checkout from here.',
      placement: 'right',
    },
    {
      target: '[data-tour="user-menu"]',
      title: 'Your Account',
      content: 'Access your profile or logout from here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Need Help?',
      content: 'Click here anytime to restart this tour.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'You\'re All Set!',
      content: 'That\'s it! Start shopping and enjoy our fresh groceries.',
    },
  ];

  // Employee tour steps
  const employeeSteps = [
    {
      target: 'body',
      placement: 'center',
      title: `Welcome, ${userName}!`,
      content: 'Let me show you around the Trinity Grocery employee dashboard.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="nav-invoices"]',
      title: 'Manage Orders',
      content: 'View and manage customer orders. You can approve pending cash payments here.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-shop"]',
      title: 'Create New Sale',
      content: 'Help customers by creating new orders through the shop.',
      placement: 'right',
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Need Help?',
      content: 'Click here anytime to restart this tour.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'Ready to Go!',
      content: 'You\'re all set to help customers!',
    },
  ];

  // Manager/Admin tour steps
  const managerSteps = [
    {
      target: 'body',
      placement: 'center',
      title: `Welcome, ${userName}!`,
      content: 'Let me give you a tour of the Trinity Grocery management dashboard.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: 'Key Metrics',
      content: 'Monitor your store\'s performance with real-time revenue, orders, and customer stats.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="nav-products"]',
      title: 'Product Management',
      content: 'Add, edit, and manage your product inventory from here.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-invoices"]',
      title: 'Order Management',
      content: 'View all orders, approve payments, and manage transactions.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-reports"]',
      title: 'Reports & Analytics',
      content: 'Access detailed reports and KPI analytics for your store.',
      placement: 'right',
    },
    {
      target: '[data-tour="nav-users"]',
      title: 'User Management',
      content: 'Manage employees, customers, and user permissions.',
      placement: 'right',
    },
    {
      target: '[data-tour="help-button"]',
      title: 'Need Help?',
      content: 'Click here anytime to restart this tour.',
      placement: 'bottom',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'All Set!',
      content: 'You\'re ready to manage your store!',
    },
  ];

  const getSteps = () => {
    switch (user?.role) {
      case 'customer':
        return customerSteps;
      case 'employee':
        return employeeSteps;
      case 'admin':
      case 'manager':
        return managerSteps;
      default:
        return customerSteps;
    }
  };

  const styles = {
    options: {
      primaryColor: '#2563eb',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: 12,
      padding: 20,
    },
    tooltipTitle: {
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 8,
    },
    tooltipContent: {
      fontSize: 14,
      lineHeight: 1.6,
    },
    buttonNext: {
      backgroundColor: '#2563eb',
      borderRadius: 8,
      padding: '10px 20px',
      fontSize: 14,
      fontWeight: 600,
    },
    buttonBack: {
      color: '#6b7280',
      marginRight: 10,
      fontSize: 14,
    },
    buttonSkip: {
      color: '#9ca3af',
      fontSize: 14,
    },
    spotlight: {
      borderRadius: 12,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  };

  return (
    <Joyride
      steps={getSteps()}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={styles}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
};
