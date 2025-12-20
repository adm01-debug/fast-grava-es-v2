
  it('should fetch pending tasks', async () => {
    const { result } = renderHook(() => useShiftHandover(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.pendingTasks).toBeDefined());
  });
});
