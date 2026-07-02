import { useState, useEffect, useCallback, useRef } from 'react';
import {
  runPortRiskAssessment as runPortRiskAssessmentService,
  runStandalonePortRiskAssessment as runStandalonePortRiskAssessmentService,
  getPortRiskAssessment as getPortRiskAssessmentService,
  getPortRiskAssessmentByTestResult as getPortRiskAssessmentByTestResultService,
  getUserPortRiskAssessments as getUserPortRiskAssessmentsService,
  getPortKnowledgeBase as getPortKnowledgeBaseService
} from '../services/portRiskService';
import { getFriendlyErrorMessage } from '../services/errorUtils';

export function usePortRisk(isAuthReady = true) {
  const [assessments, setAssessments] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthReadyRef = useRef(isAuthReady);

  useEffect(() => {
    isAuthReadyRef.current = isAuthReady;
  }, [isAuthReady]);

  const fetchAssessments = useCallback(async () => {
    if (!isAuthReadyRef.current) {
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await getUserPortRiskAssessmentsService();
      if (response.data) {
        setAssessments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch port risk assessments:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssessment = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPortRiskAssessmentService(id);
      if (response.data) {
        setCurrentAssessment(response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to fetch port risk assessment:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssessmentByTestResult = useCallback(async (testResultId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPortRiskAssessmentByTestResultService(testResultId);
      if (response.data) {
        setCurrentAssessment(response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to fetch port risk assessment by test result:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runAssessment = useCallback(async (testResultId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await runPortRiskAssessmentService(testResultId);
      if (response.data) {
        setCurrentAssessment(response.data);
        // Refresh assessments list
        await fetchAssessments();
      }
      return response;
    } catch (err) {
      console.error('Failed to run port risk assessment:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAssessments]);

  const runStandaloneAssessment = useCallback(async (ipAddress) => {
    try {
      setLoading(true);
      setError(null);

      const response = await runStandalonePortRiskAssessmentService(ipAddress);
      if (response.data) {
        setCurrentAssessment(response.data);
        // Refresh assessments list
        await fetchAssessments();
      }
      return response;
    } catch (err) {
      console.error('Failed to run standalone port risk assessment:', err);
      setError(getFriendlyErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAssessments]);

  const fetchKnowledgeBase = useCallback(async () => {
    try {
      const response = await getPortKnowledgeBaseService();
      if (response.data) {
        setKnowledgeBase(response.data);
      }
      return response;
    } catch (err) {
      console.error('Failed to fetch port knowledge base:', err);
      // Don't set error for knowledge base - it's non-critical
      throw err;
    }
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      fetchAssessments();
      fetchKnowledgeBase();
    } else {
      // Reset state when not authenticated
      setAssessments(null);
      setCurrentAssessment(null);
      setKnowledgeBase(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchAssessments, fetchKnowledgeBase, isAuthReady]);

  return {
    assessments,
    currentAssessment,
    knowledgeBase,
    loading,
    error,
    refetch: fetchAssessments,
    fetchAssessment,
    fetchAssessmentByTestResult,
    runAssessment,
    runStandaloneAssessment,
    fetchKnowledgeBase
  };
}

export default usePortRisk;
