// frontend/src/hooks/useQuiz.js
import { useState, useEffect, useCallback } from "react";
import quizService from "../services/quiz";

export const useQuiz = (id) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data } = await quizService.getById(id);
      setQuiz(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement du quiz");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return { quiz, loading, error, refetch: fetchQuiz };
};

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await quizService.getAll();
      setQuizzes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des quiz");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, loading, error, refetch: fetchQuizzes };
};

export const useAdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await quizService.admin.getAll();
      setQuizzes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des quiz");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const createQuiz = async (quizData) => {
    try {
      await quizService.admin.create(quizData);
      await fetchQuizzes();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Erreur" };
    }
  };

  const deleteQuiz = async (id) => {
    try {
      await quizService.admin.delete(id);
      await fetchQuizzes();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Erreur" };
    }
  };

  return { quizzes, loading, error, createQuiz, deleteQuiz, refetch: fetchQuizzes };
};